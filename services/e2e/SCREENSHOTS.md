# Screenshots

Visual regression baselines captured by E2E tests using Playwright's `toHaveScreenshot()`.
Each row shows desktop (1280×720) and mobile (390×844) side by side.

Update baselines: `npx playwright test --update-snapshots`

## Login

| Screen | Desktop | Mobile |
|--------|---------|--------|
| Unknown error | ![](screenshots/login-unknown-error-desktop.png) | ![](screenshots/login-unknown-error-mobile.png) |

## Register

| Screen | Desktop | Mobile |
|--------|---------|--------|
| Duplicate error | ![](screenshots/register-duplicate-error-desktop.png) | ![](screenshots/register-duplicate-error-mobile.png) |

## Lists

| Screen | Desktop | Mobile |
|--------|---------|--------|
| After register | ![](screenshots/lists-after-register-desktop.png) | ![](screenshots/lists-after-register-mobile.png) |
| After login | ![](screenshots/lists-after-login-desktop.png) | ![](screenshots/lists-after-login-mobile.png) |
| Before create | ![](screenshots/lists-before-create-desktop.png) | ![](screenshots/lists-before-create-mobile.png) |
| After create | ![](screenshots/lists-after-create-desktop.png) | ![](screenshots/lists-after-create-mobile.png) |
| Three lists | ![](screenshots/lists-three-lists-desktop.png) | ![](screenshots/lists-three-lists-mobile.png) |
| After rename | ![](screenshots/lists-after-rename-desktop.png) | ![](screenshots/lists-after-rename-mobile.png) |
| After reorder | ![](screenshots/lists-after-reorder-desktop.png) | ![](screenshots/lists-after-reorder-mobile.png) |
| After delete | ![](screenshots/lists-after-delete-desktop.png) | ![](screenshots/lists-after-delete-mobile.png) |

## Tasks

| Screen | Desktop | Mobile |
|--------|---------|--------|
| Empty | ![](screenshots/tasks-empty-desktop.png) | ![](screenshots/tasks-empty-mobile.png) |
| Created | ![](screenshots/tasks-created-desktop.png) | ![](screenshots/tasks-created-mobile.png) |
| Detail | ![](screenshots/task-detail-desktop.png) | ![](screenshots/task-detail-mobile.png) |
| Before edit | ![](screenshots/tasks-before-edit-desktop.png) | ![](screenshots/tasks-before-edit-mobile.png) |
| After edit | ![](screenshots/tasks-after-edit-desktop.png) | ![](screenshots/tasks-after-edit-mobile.png) |
| Before complete | ![](screenshots/tasks-before-complete-desktop.png) | ![](screenshots/tasks-before-complete-mobile.png) |
| After complete | ![](screenshots/tasks-after-complete-desktop.png) | ![](screenshots/tasks-after-complete-mobile.png) |
| Before delete | ![](screenshots/tasks-before-delete-desktop.png) | ![](screenshots/tasks-before-delete-mobile.png) |
| After delete | ![](screenshots/tasks-after-delete-desktop.png) | ![](screenshots/tasks-after-delete-mobile.png) |
