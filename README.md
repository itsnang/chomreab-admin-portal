# Attendance Admin

Web dashboard for the attendance system — admin (students/classrooms/linking codes) and teacher (daily attendance marking) roles in one app, gated by role. Cloned from `hang-neak-admin-web-mobile`'s stack/conventions (Next.js App Router + shadcn/ui + TanStack Query).

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- shadcn/ui ("New York") + Tailwind CSS v4
- TanStack Query v5, Zustand (client state only), React Hook Form + Zod
- Cookie-based JWT session (httpOnly), talking to `attendance-api`

## Setup

```bash
cp .env.local.example .env.local   # API_BASE_URL defaults to http://localhost:8091
npm install
npm run dev   # http://localhost:3001
```

Requires `attendance-api` running (see its own README) with at least one seeded admin/teacher user (`npm run seed` there).

## Commands

```bash
npm run dev      # Turbopack dev server on :3001
npm run build    # production build (also runs tsc + lint)
npm run lint
npx tsc --noEmit
```

No test runner is configured — `npm run lint && npx tsc --noEmit` is the quality gate.

See `CLAUDE.md` for architecture/feature-slice conventions.
