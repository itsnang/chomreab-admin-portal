# Server actions map the API's snake_case responses to camelCase

The API's wire format is `snake_case` (see `attendance-api` ADR-0001). Each `*.action.ts` declares a `*Api` interface describing the wire shape and a small `toX()` mapper to the slice's `camelCase` domain type, so the rest of the slice never sees wire names.

The mapping looks removable, because the API's own query handlers return `camelCase` interfaces — a global interceptor rewrites the keys on the way out, after those handlers have run. Deleting the mappers on that reasoning is a mistake already made once: every mapped field became `undefined`, and the staff screen crashed on `t.classroomNames.length`. Verify against an actual response before assuming a field arrives in `camelCase`.
