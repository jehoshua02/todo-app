# M001: M001

**Vision:** 

## Slices

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: 

- [x] **S03: S03** `risk:medium` `depends:[]`
  > After this: 

- [x] **S04: S04** `risk:high` `depends:[]`
  > After this: After registering and logging in, user sees a Lists screen with their auto-created Inbox. JWT middleware protects all task service endpoints. Polished mobile UI. E2E test proves it.

- [x] **S05: S05** `risk:medium` `depends:[]`
  > After this: User taps 'New List', enters a name, and sees it appear alongside Inbox. E2E test covers creation.

- [ ] **S06: User can rename a list** `risk:low` `depends:[S05]`
  > After this: User renames a list. Inbox cannot be renamed. E2E test covers both cases.

- [ ] **S07: User can delete a list (orphans move to Inbox)** `risk:medium` `depends:[S05]`
  > After this: User deletes a list containing tasks. Tasks reappear in Inbox. Inbox cannot be deleted. E2E test proves orphan handling.

- [ ] **S08: User can reorder lists** `risk:low` `depends:[S05]`
  > After this: User reorders lists. New order persists across refresh. E2E test covers it.

- [ ] **S09: User can create a task in a list** `risk:medium` `depends:[S04]`
  > After this: User taps into a list, creates a task with title. Task appears in the list view sorted by creation order. E2E test proves it.

- [ ] **S10: User can complete a task** `risk:low` `depends:[S09]`
  > After this: User marks a task complete. Task disappears from the default list view. E2E test proves visibility change.

- [ ] **S11: User can edit a task** `risk:low` `depends:[S09]`
  > After this: User opens task detail, edits title/description/due date, saves. Changes persist. Tasks sort by due date. E2E test covers it.

- [ ] **S12: User can delete a task** `risk:low` `depends:[S09]`
  > After this: User deletes a task. Task is removed permanently. E2E test confirms deletion.

- [ ] **S13: User can view task detail screen** `risk:low` `depends:[S09]`
  > After this: User taps a task to see full detail view with title, description, due date, and completion status. Three-screen drill-down complete. E2E test with screenshot.
