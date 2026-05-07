# S05: User can create a list — UAT

**Milestone:** M001
**Written:** 2026-05-07T10:36:26.241Z

## UAT: S05 — User can create a list

### Scenario 1: Create a new list
1. Register and land on Lists page
2. Tap "New List" button
3. Enter "Shopping" in the name input
4. Tap "Save"
5. **Verify:** "Shopping" appears below Inbox in the list

### Scenario 2: Create multiple lists
1. After Scenario 1, tap "New List" again
2. Enter "Work" and save
3. **Verify:** Three lists visible: Inbox, Shopping, Work

### Scenario 3: Cancel creation
1. Tap "New List"
2. Tap "Cancel"
3. **Verify:** Input disappears, no new list created

### Scenario 4: Empty name rejected
1. Tap "New List"
2. Leave input empty
3. **Verify:** Save button is disabled

### Scenario 5: Name validation
1. POST /api/tasks/lists with empty/whitespace/101-char name
2. **Verify:** 400 response with error message
