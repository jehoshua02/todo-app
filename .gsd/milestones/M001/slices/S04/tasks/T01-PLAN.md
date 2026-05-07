---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T01: Prisma schema + migration for lists table

Add Prisma to task service. Define List model with id, user_id, name, is_system, position, created_at. Generate migration. Verify migration applies against tasks-db.

## Inputs

- `Auth service schema as pattern reference`

## Expected Output

- `services/tasks/prisma/schema.prisma with List model`
- `Migration SQL file`
- `Prisma client generated`

## Verification

Migration applies cleanly: npx prisma migrate deploy succeeds against tasks-db
