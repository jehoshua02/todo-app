---
estimated_steps: 20
estimated_files: 2
skills_used: []
---

# T01: Build screenshot markdown generator script and regenerate SCREENSHOTS.md

The existing e2e/SCREENSHOTS.md was manually written during S15. This task replaces it with an auto-generated version produced by a Node script that reads e2e/screenshots/, parses the {theme}-{screen}-{state}-{viewport}.png naming convention, groups by screen, and renders a markdown file with desktop/mobile side-by-side tables.

Steps:
1. Read the current e2e/SCREENSHOTS.md to understand the target format — markdown tables per screen section, each row showing a state with desktop and mobile screenshots side by side.
2. Create e2e/generate-screenshots-md.mjs — a standalone Node script (no dependencies) that:
   - Reads all .png files from e2e/screenshots/
   - Parses filenames using the pattern: {theme}-{screen}-{state}-{viewport}.png where viewport is 'desktop' or 'mobile'
   - Groups screenshots by screen (e.g. login, register, lists, tasks)
   - For each screen, creates a markdown table with columns: Screen | Desktop | Mobile
   - Each row is a unique {theme}-{state} combination with the desktop and mobile image links
   - Orders screens: Login, Register, Lists, Tasks (alphabetical within each if new ones appear)
   - Writes the result to e2e/SCREENSHOTS.md
3. Run the script and verify the output matches the current manually-written content (modulo the header line about viewport dimensions which can be simplified or kept).
4. Add a package.json script entry if package.json exists at root, or document how to run it.

Must-haves:
- [ ] Script parses {theme}-{screen}-{state}-{viewport}.png filenames correctly
- [ ] Output groups by screen with markdown tables
- [ ] Desktop and mobile screenshots appear side by side in each row
- [ ] Script is idempotent — running twice produces the same output
- [ ] Works with current 36 screenshots and will work when S17 adds a second theme
- [ ] No external dependencies — uses only Node built-ins (fs, path)

## Inputs

- `e2e/SCREENSHOTS.md`
- `e2e/screenshots/`

## Expected Output

- `e2e/generate-screenshots-md.mjs`
- `e2e/SCREENSHOTS.md`

## Verification

node e2e/generate-screenshots-md.mjs && grep -c '^## ' e2e/SCREENSHOTS.md | grep -q '[4-9]' && grep -c '\!\.png)' e2e/SCREENSHOTS.md | grep -q '[1-9]'
