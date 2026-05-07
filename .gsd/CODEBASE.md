# Codebase Map

Generated: 2026-05-07T20:02:51Z | Files: 76 | Described: 0/76
<!-- gsd:codebase-meta {"generatedAt":"2026-05-07T20:02:51Z","fingerprint":"cf10a6a074f8e7eb59a9c83708d4c6a84fad47e3","fileCount":76,"truncated":false} -->

### (root)/
- `.env.example`
- `.gitignore`
- `docker-compose.yml`
- `package-lock.json`
- `package.json`
- `playwright.config.ts`
- `README.md`

### e2e/
- `e2e/auth-flow.spec.ts`
- `e2e/virtual-authenticator.ts`

### services/auth/
- `services/auth/.gitignore`
- `services/auth/Dockerfile`
- `services/auth/package-lock.json`
- `services/auth/package.json`
- `services/auth/prisma.config.ts`
- `services/auth/tsconfig.json`

### services/auth/prisma/
- `services/auth/prisma/schema.prisma`

### services/auth/prisma/migrations/
- `services/auth/prisma/migrations/migration_lock.toml`

### services/auth/prisma/migrations/20260506_init/
- `services/auth/prisma/migrations/20260506_init/migration.sql`

### services/auth/src/
- `services/auth/src/app.ts`
- `services/auth/src/challenges.ts`
- `services/auth/src/cookies.test.ts`
- `services/auth/src/cookies.ts`
- `services/auth/src/db.ts`
- `services/auth/src/health.ts`
- `services/auth/src/index.ts`
- `services/auth/src/login.test.ts`
- `services/auth/src/login.ts`
- `services/auth/src/logout.test.ts`
- `services/auth/src/logout.ts`
- `services/auth/src/refresh.test.ts`
- `services/auth/src/refresh.ts`
- `services/auth/src/register.test.ts`
- `services/auth/src/register.ts`
- `services/auth/src/tokens.test.ts`
- `services/auth/src/tokens.ts`

### services/frontend/
- `services/frontend/.dockerignore`
- `services/frontend/.gitignore`
- `services/frontend/Dockerfile`
- `services/frontend/index.html`
- `services/frontend/nginx.conf`
- `services/frontend/package-lock.json`
- `services/frontend/package.json`
- `services/frontend/postcss.config.js`
- `services/frontend/tailwind.config.js`
- `services/frontend/tsconfig.json`
- `services/frontend/vite.config.ts`

### services/frontend/src/
- `services/frontend/src/App.tsx`
- `services/frontend/src/index.css`
- `services/frontend/src/main.tsx`
- `services/frontend/src/test-setup.ts`

### services/frontend/src/api/
- `services/frontend/src/api/auth.test.ts`
- `services/frontend/src/api/auth.ts`
- `services/frontend/src/api/tasks.ts`

### services/frontend/src/auth/
- `services/frontend/src/auth/AuthContext.test.tsx`
- `services/frontend/src/auth/AuthContext.tsx`

### services/frontend/src/pages/
- `services/frontend/src/pages/Home.tsx`
- `services/frontend/src/pages/Lists.tsx`
- `services/frontend/src/pages/Login.tsx`
- `services/frontend/src/pages/Register.tsx`

### services/tasks/
- `services/tasks/.gitignore`
- `services/tasks/Dockerfile`
- `services/tasks/package-lock.json`
- `services/tasks/package.json`
- `services/tasks/prisma.config.ts`
- `services/tasks/tsconfig.json`

### services/tasks/prisma/
- `services/tasks/prisma/schema.prisma`

### services/tasks/prisma/migrations/
- `services/tasks/prisma/migrations/migration_lock.toml`

### services/tasks/prisma/migrations/20260507_init/
- `services/tasks/prisma/migrations/20260507_init/migration.sql`

### services/tasks/src/
- `services/tasks/src/app.ts`
- `services/tasks/src/auth.test.ts`
- `services/tasks/src/auth.ts`
- `services/tasks/src/db.ts`
- `services/tasks/src/health.ts`
- `services/tasks/src/index.ts`
- `services/tasks/src/lists.test.ts`
- `services/tasks/src/lists.ts`
