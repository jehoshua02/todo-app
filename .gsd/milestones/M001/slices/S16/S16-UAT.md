# S16: Screenshots markdown — UAT

**Milestone:** M001
**Written:** 2026-05-08T04:18:14.091Z

## UAT: S16 — Screenshots markdown

### Test: SCREENSHOTS.md structure
- Open `e2e/SCREENSHOTS.md`
- Verify 4 sections: Login, Register, Lists, Tasks
- Each section has a markdown table with Screen | Desktop | Mobile columns
- **Result:** PASS

### Test: Image references
- All 18 rows reference valid screenshot filenames
- Paths use `screenshots/default-{screen}-{state}-{viewport}.png` format
- **Result:** PASS

### Test: Desktop/mobile side by side
- Each row shows both desktop and mobile variants of the same screen state
- **Result:** PASS
