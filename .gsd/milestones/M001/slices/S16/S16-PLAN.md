# S16: Screenshots markdown

**Goal:** SCREENSHOTS.md is auto-generated from the screenshot directory, grouped by screen with desktop/mobile side by side, and stays in sync as new themes or screens are added.
**Demo:** SCREENSHOTS.md displays all screenshots grouped by screen.

## Must-Haves

- 1. A script generates SCREENSHOTS.md from the files in e2e/screenshots/
- 2. The generated output matches the current manual content (Login, Register, Lists, Tasks sections with desktop/mobile columns)
- 3. Running the script after adding/removing screenshot files produces an updated SCREENSHOTS.md with no manual editing
- 4. The script handles the {theme}-{screen}-{state}-{viewport}.png naming convention and groups correctly

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Build screenshot markdown generator script and regenerate SCREENSHOTS.md** `est:30m`
  The existing e2e/SCREENSHOTS.md was manually written during S15. This task replaces it with an auto-generated version produced by a Node script that reads e2e/screenshots/, parses the {theme}-{screen}-{state}-{viewport}.png naming convention, groups by screen, and renders a markdown file with desktop/mobile side-by-side tables.
  - Files: `e2e/generate-screenshots-md.mjs`, `e2e/SCREENSHOTS.md`
  - Verify: node e2e/generate-screenshots-md.mjs && grep -c '^## ' e2e/SCREENSHOTS.md | grep -q '[4-9]' && grep -c '\!\.png)' e2e/SCREENSHOTS.md | grep -q '[1-9]'

## Files Likely Touched

- e2e/generate-screenshots-md.mjs
- e2e/SCREENSHOTS.md
