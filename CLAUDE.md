# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Important: Read Next.js docs before writing code

This project uses **Next.js 16**, which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Before writing any code that touches Next.js internals, read the relevant guide in `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev      # Start dev server with Turbopack on http://localhost:3001
npm run build    # Production build (also runs tsc + lint)
npm run lint     # ESLint only
npx tsc --noEmit # Type check only (no build output)
```

No test runner is configured yet. Use `npm run lint && npx tsc --noEmit` as the quality gate.

To add a shadcn component: `npx shadcn@latest add <component-name>`

## Architecture

### Feature-Module structure

Business logic is organized by domain under `src/features/<domain>/`:

```
src/features/<domain>/
  actions/
    index.ts        ← barrel re-export only (no 'use server' here)
    <sub-domain>.ts ← 'use server' at top of each file
  components/
  hooks/
  schemas/          ← Zod schemas + inferred types for every form in this slice
    index.ts        ← barrel re-export only
    <form>.schema.ts
  store/
    <domain>.store.ts ← zustand store (business state only) — most slices here are
                         pure server state via TanStack Query and skip this
  types.ts
```

**Current slices:**

| Slice | Responsibility |
|-------|---------------|
| `auth` | Login (tries `/auth/admin/login` then `/auth/teacher/login`), session cookies, `getCurrentUser` |

**Planned slices** (add following the same shape): `classrooms`, `students`, `linking` (linking codes — folds into the `students` detail view, not a separate top-level nav item), `attendance` (teacher's daily roster + marking).

**Dependency direction:** Slices must not import from each other. Import from `@/components/shared/` or `@/lib/` for shared code. Exceptions:
- `students` slice → imports `useClassrooms` from `classrooms` (classroom picker + name lookup on the students list)
- `attendance` slice → imports `useClassrooms` from `classrooms` (classroom picker for the roster)
- `classrooms` slice → imports `useTeachers` from `staff` (teacher picker when assigning a classroom)

**Shared presentational components** live in `src/components/shared/` — used across slices, must not import from any feature slice: `page-shell.tsx`, `status-chip.tsx`, `form-controls.tsx`, `query-state.tsx`, `drawer-sheet.tsx`, `theme-toggle.tsx`, `navigation-progress.tsx`, `icons.tsx`, `thumb.tsx`.

**Rules enforced by reviewers:**
- `'use server'` goes on each action file, never on `index.ts`
- Auth check must be the **first** thing in every action — derive the user's identity server-side from the session cookie, never accept it from the caller
- `revalidatePath()` / `revalidateTag()` must be called **after** the mutation commits, never before
- Actions that return `{ error?: string }` must `return { error: '...' }` on failure, not `throw`
- Component files use **kebab-case** (`dashboard-screen.tsx`), matching `src/components/ui/`; the exported component keeps **PascalCase**. Non-component modules follow `*.store.ts`, `*.action.ts`, `use-*.ts`, `types.ts`
- **Every form must use React Hook Form + Zod.** Define a `z.object()` schema in `schemas/<form>.schema.ts`, export the inferred type (`z.infer<typeof schema>`), wire up with `useForm({ resolver: zodResolver(schema), defaultValues: { ... } })`. Avoid `z.coerce` and `.default()` — they break `exactOptionalPropertyTypes`; parse numbers explicitly in `onSubmit`.

### Route groups

`src/app/` uses parenthesised route groups (URL-invisible):
- `(auth)` → `/login` — unauthenticated
- `(dashboard)` → `/dashboard`, and future `/dashboard/*` routes — authenticated shell, gated in `src/proxy.ts`. Nav items should be filtered by `user.role` (`'admin' | 'teacher'`) from `getCurrentUser()` — admins see students/classrooms/linking codes, teachers see attendance marking for their assigned classes.

### Environment variables

Two separate modules enforce the server/client boundary:

- `src/env.ts` — server-only (imports `server-only`). Import this in Server Components and actions. `API_BASE_URL` defaults to `http://localhost:8091` (`attendance-api`'s dev port).
- `src/env.client.ts` — safe for Client Components. Only `NEXT_PUBLIC_*` vars.

**Never import `src/env.ts` from a Client Component.**

### Auth

Session cookies: `att_access_token`, `att_refresh_token`, `att_user` (`src/features/auth/cookies.ts`), httpOnly, written server-side only (`src/lib/api/server.ts` / `src/features/auth/actions/session-store.ts`). There is no self-service registration — admins create teacher accounts (backend `admin` module, not yet built) — and no separate parent role: parents only interact via the Telegram bot in `attendance-api`, never through this app.

### TanStack Query v5

`src/app/providers.tsx` wraps the app in `QueryClientProvider`, created with `useState(() => makeQueryClient())` so each server request gets its own instance while client-side navigations reuse it.

### TailwindCSS v4

Config lives entirely in `src/app/globals.css` — there is no `tailwind.config.ts`.

### shadcn/ui

Style: **New York**, base color: **Neutral**, CSS variables: **yes**. Components are generated into `src/components/ui/`. The `cn()` utility is at `src/lib/utils.ts`. Use `sonner` for toasts, not the deprecated `toast`.

### File naming

All files use **kebab-case**, including React component files. The file name is kebab-case; the **exported symbol stays PascalCase**.

### TypeScript strictness

`tsconfig.json` enables several flags beyond `strict: true`:
- `noUncheckedIndexedAccess` — all array/object index reads may be `undefined`
- `exactOptionalPropertyTypes` — passing `prop={undefined}` explicitly is a type error when the type is `T` not `T | undefined`
- `noImplicitOverride`, `noFallthroughCasesInSwitch`
