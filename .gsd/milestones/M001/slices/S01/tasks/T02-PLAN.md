---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T02: Auth-DB Prisma schema and migration

Initialize Prisma in the auth service. Create schema with users table (id, username, created_at), credentials table (id, user_id FK, credential_id, public_key, counter, transports, created_at), and refresh_tokens table (id, user_id FK, token_hash, expires_at, revoked, created_at). Run prisma migrate dev to generate migration. Create db.ts module exporting PrismaClient singleton.

## Inputs

- `T01 — auth service and auth-db running in Docker`

## Expected Output

- `Prisma schema with users, credentials, refresh_tokens tables`
- `Generated migration SQL`
- `db.ts exporting PrismaClient singleton`

## Verification

cd services/auth && npx prisma migrate deploy && node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.$connect().then(()=>{console.log('ok');process.exit(0)})"
