# M001: Todo App MVP

**Vision:** Multi-tenant task management app with passkey auth, mobile-first UI, and full E2E coverage.

## Slices

- [x] **S02: Passkey registration** `risk:medium` `depends:[]`
  > After this: User can register with a passkey.

- [x] **S03: Auth context and logout** `risk:medium` `depends:[]`
  > After this: Frontend tracks auth state, user can log out.

- [x] **S04: Lists screen with Inbox** `risk:high` `depends:[]`
  > After this: User sees a Lists screen with their auto-created Inbox.

- [x] **S05: Create a list** `risk:medium` `depends:[]`
  > After this: User taps New List, enters a name, sees it appear.

- [x] **S06: Rename a list** `risk:low` `depends:[S05]`
  > After this: User renames a list. Inbox cannot be renamed.

- [x] **S07: Delete a list** `risk:medium` `depends:[S05]`
  > After this: User deletes a list. Tasks reappear in Inbox.

- [x] **S08: Reorder lists** `risk:low` `depends:[S05]`
  > After this: User reorders lists. Order persists.

- [x] **S09: Create a task** `risk:medium` `depends:[S04]`
  > After this: User creates a task with title in a list.

- [x] **S10: Complete a task** `risk:low` `depends:[S09]`
  > After this: User marks a task complete. Visual state changes.

- [x] **S11: Edit a task** `risk:low` `depends:[S09]`
  > After this: User edits title/description/due date. Changes persist.

- [x] **S12: Delete a task** `risk:low` `depends:[S09]`
  > After this: User deletes a task permanently.

- [x] **S13: Task detail screen** `risk:low` `depends:[S09]`
  > After this: User taps a task to see full detail view. Edit and delete available from detail.

- [x] **S14: E2E Docker image with browser** `risk:low` `depends:[S13]`
  > After this: E2E service builds from a Dockerfile with Chromium baked in.

- [ ] **S15: Flatten screenshot paths** `risk:low` `depends:[S14]`
  > After this: Screenshots at screenshots/{theme}-{screen}-{viewport}.png.

- [ ] **S16: Screenshots markdown** `risk:low` `depends:[S15]`
  > After this: SCREENSHOTS.md displays all screenshots grouped by screen.

- [ ] **S17: Theme picker** `risk:medium` `depends:[S15]`
  > After this: Current look is default theme. Second theme available. User picks via switcher.

- [ ] **S18: Discuss frontend code organization** `risk:low` `depends:[S13]`
  > After this: Frontend folder structure agreed upon and reorganized.

- [ ] **S19: Discuss backend service code organization** `risk:low` `depends:[S13]`
  > After this: Backend service structure agreed upon and reorganized.

## Boundary Map

Not provided.
