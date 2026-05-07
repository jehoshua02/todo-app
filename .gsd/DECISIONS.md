# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 | M001 | arch | Auth service topology | Separate Express auth service with dedicated Postgres | User plans future multi-service expansion. Central auth with JWT means one login serves all services. | No | human |
| D002 | M001 | arch | Session mechanism | JWT (HS256) access token (15 min) + DB-backed refresh token | Enables cross-service auth without inter-service runtime calls. Refresh tokens allow revocation. | Yes — upgrade to RS256/JWKS if third-party services added | human |
| D003 | M001 | arch | Database isolation | Separate Postgres instance per service (auth-db, tasks-db) | Forces clean service boundaries at data layer. SRP applied to infrastructure. No cross-DB joins possible. | No | human |
| D004 | M001 | arch | Docker network segmentation | Three isolated networks: frontend-net (frontend, auth, tasks), auth-net (auth, auth-db), tasks-net (tasks, tasks-db) | Databases only reachable by their owning service. Frontend cannot reach databases. Defense in depth. | No | human |
| D005 | M001 | library | Frontend framework | React + Vite + TypeScript + Tailwind CSS | Fast build, utility-first mobile design, deep ecosystem. Same language (TS) across full stack. | No | collaborative |
| D006 | M001 | library | Backend framework | Node.js + Express + TypeScript for both services | Same language across stack. Express has widest middleware ecosystem and best @simplewebauthn examples. | No | collaborative |
| D007 | M001 | library | ORM | Prisma with separate schema files per service | Type-safe queries, declarative schema, clean migration story. Separate schemas enforce DB isolation. | No | collaborative |
| D008 | M001 | convention | Navigation pattern | Three-screen drill-down: Lists → List → Task. Full-screen views, back navigation. | Clean mobile pattern. Each screen is focused. User explicitly rejected sidebar approach. | No | human |
| D009 | M001 | convention | Passkey browser support policy | Supported browsers only — no fallback for unsupported browsers | Simplifies auth implementation. Clear product decision — modern browsers only. | No | human |
| D010 | M001 | convention | Domain entity naming: "todo" vs "task" | Use "task/tasks" throughout — DB tables, API endpoints, UI labels, variable names | User prefers "tasks" over "todos" as the domain term. More natural language, aligns with how they describe the product. | No | human |
