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

- [x] **S06: S06** `risk:low` `depends:[]`
  > After this: User renames a list. Inbox cannot be renamed.

- [x] **S07: S07** `risk:medium` `depends:[]`
  > After this: User deletes a list. Tasks reappear in Inbox.

- [x] **S08: S08** `risk:low` `depends:[]`
  > After this: User reorders lists. Order persists.

- [x] **S09: S09** `risk:medium` `depends:[]`
  > After this: User creates a task with title in a list.

- [x] **S10: S10** `risk:low` `depends:[]`
  > After this: User marks a task complete. Visual state changes.

- [x] **S11: S11** `risk:low` `depends:[]`
  > After this: User edits title/description/due date. Changes persist.

- [x] **S12: S12** `risk:low` `depends:[]`
  > After this: User deletes a task permanently.

- [x] **S13: S13** `risk:low` `depends:[]`
  > After this: User taps a task to see full detail view. Edit and delete available from detail.

- [x] **S14: S14** `risk:low` `depends:[]`
  > After this: E2E service builds from a Dockerfile with Chromium baked in.

- [x] **S15: S15** `risk:low` `depends:[]`
  > After this: Screenshots at screenshots/{theme}-{screen}-{viewport}.png.

- [x] **S16: S16** `risk:low` `depends:[]`
  > After this: SCREENSHOTS.md displays all screenshots grouped by screen.

- [ ] **S17: Theme picker** `risk:medium` `depends:[S15,S20]`
  > After this: Current look is default theme. Second theme available. User picks via switcher.

- [ ] **S18: Discuss frontend code organization** `risk:low` `depends:[S21]`
  > After this: Frontend folder structure agreed upon and reorganized.

- [ ] **S19: Discuss backend service code organization** `risk:low` `depends:[S21]`
  > After this: Backend service structure agreed upon and reorganized.

- [ ] **S20: UX love audit** `risk:low` `depends:[S21]`
  > After this: After this: improvement list produced from screenshot review, new slices planned into roadmap.

- [x] **S21: S21** `risk:medium` `depends:[]`
  > After this: App served over HTTPS via Tailscale Funnel. Passkey auth works on Android Chrome. Clone repo, drop .env, compose up — that's a deployment. WSL stays up after Windows reboot.

## Boundary Map

Not provided.
