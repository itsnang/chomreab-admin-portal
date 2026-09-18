# Feature slices do not import each other

A slice under `src/features/<domain>/` may import from `@/components/shared/` and `@/lib/`, but not from another slice. Shared presentational components live in `src/components/shared/` and must not import from any slice.

Two exceptions are deliberate and closed: `students` and `attendance` both import `useClassrooms` from `classrooms`, because each needs a classroom picker and name lookup. Duplicating that query into either slice would mean two caches for one resource. Any further exception should be an explicit amendment here rather than a quiet import.
