import { test, expect } from "@playwright/test";
import {
  addVirtualAuthenticator,
  removeVirtualAuthenticator,
  type VirtualAuthenticator,
} from "./virtual-authenticator";

let auth: VirtualAuthenticator;

const username = `e2e-${Date.now()}`;

test.describe("Auth + Lists flow", () => {
  test.beforeEach(async ({ page }) => {
    auth = await addVirtualAuthenticator(page);
  });

  test.afterEach(async () => {
    if (auth) await removeVirtualAuthenticator(auth);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("user can register, see Inbox, logout, and login again", async ({
    page,
  }, testInfo) => {
    // --- Register ---
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Create account" })
    ).toBeVisible();

    await page.getByLabel("Username").fill(username);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    // After registration, should land on the lists page with Inbox visible
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Screenshot: lists page after registration
    await page.screenshot({ path: `e2e/screenshots/${testInfo.project.name}/lists-after-register.png` });

    // --- Logout ---
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    // --- Login ---
    await page.getByLabel("Username").fill(username);
    await page.getByRole("button", { name: "Sign in with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Screenshot: lists page after login
    await page.screenshot({ path: `e2e/screenshots/${testInfo.project.name}/lists-after-login.png` });
  });

  test("session persists across page refresh", async ({ page }) => {
    // Register a fresh user
    const refreshUser = `e2e-refresh-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(refreshUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });

    // Refresh — session should persist via cookie-based refresh
    await page.reload();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();
  });

  test("user isolation — second user cannot see first user's data", async ({
    page,
  }) => {
    // Register user A
    const userA = `e2e-iso-a-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(userA);
    await page.getByRole("button", { name: "Register with passkey" }).click();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });

    // Logout user A
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Register user B
    const userB = `e2e-iso-b-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(userB);
    await page.getByRole("button", { name: "Register with passkey" }).click();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });

    // Both users should see only their own Inbox (1 list item)
    const listItems = page.locator("ul > li");
    await expect(listItems).toHaveCount(1);
    await expect(listItems.first()).toContainText("Inbox");
  });

  test("registering a duplicate username shows an error", async ({ page }, testInfo) => {
    // Register the first user
    const dupUser = `e2e-dup-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(dupUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });

    // Logout
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Attempt to register the same username again
    await page.goto("/register");
    await page.getByLabel("Username").fill(dupUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    // Should show an error and stay on the register page
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/register-duplicate-error.png`,
    });
  });

  test("logging in with an unknown username shows an error", async ({
    page,
  }, testInfo) => {
    const unknownUser = `e2e-unknown-${Date.now()}`;
    await page.goto("/login");
    await page.getByLabel("Username").fill(unknownUser);
    await page.getByRole("button", { name: "Sign in with passkey" }).click();

    // Should show an error and stay on the login page
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/login-unknown-error.png`,
    });
  });

  test("user can rename a list but not Inbox", async ({ page }, testInfo) => {
    const renameUser = `e2e-rename-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(renameUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Create a list to rename
    await page.getByRole("button", { name: "New List" }).click();
    await page.getByLabel("New list name").fill("Old Name");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Old Name")).toBeVisible({ timeout: 5_000 });

    // Click the rename button to start renaming
    await page.getByLabel("Rename Old Name").click();

    // Should show rename input
    const renameInput = page.getByLabel("Rename list");
    await expect(renameInput).toBeVisible();
    await expect(renameInput).toHaveValue("Old Name");

    // Clear and type new name, then press Enter
    await renameInput.fill("New Name");
    await renameInput.press("Enter");

    // Should show the new name
    await expect(page.getByText("New Name")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Old Name")).not.toBeVisible();

    // Screenshot: after rename
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-after-rename.png`,
    });

    // Verify Inbox has no rename button (system lists cannot be renamed)
    await expect(page.getByLabel("Rename Inbox")).not.toBeVisible();
  });

  test("user can delete a list but not Inbox", async ({ page }, testInfo) => {
    const deleteUser = `e2e-delete-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(deleteUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Create a list to delete
    await page.getByRole("button", { name: "New List" }).click();
    await page.getByLabel("New list name").fill("To Delete");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("To Delete")).toBeVisible({ timeout: 5_000 });

    const listItems = page.locator("ul > li");
    await expect(listItems).toHaveCount(2);

    // Inbox should not have a delete button
    await expect(page.getByLabel("Delete Inbox")).not.toBeVisible();

    // Click delete button on the created list
    await page.getByLabel("Delete To Delete").click();

    // Confirmation should appear
    await expect(page.getByText('Delete “To Delete”?')).toBeVisible();

    // Confirm deletion
    await page.getByLabel("Confirm delete").click();

    // List should be removed
    await expect(page.getByText("To Delete")).not.toBeVisible({ timeout: 5_000 });
    await expect(listItems).toHaveCount(1);

    // Inbox should still be there
    await expect(page.getByText("Inbox")).toBeVisible();

    // Screenshot: after delete
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-after-delete.png`,
    });
  });

  test("user can reorder lists and order persists after refresh", async ({ page }, testInfo) => {
    const reorderUser = `e2e-reorder-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(reorderUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Create two lists: Work and Personal
    await page.getByRole("button", { name: "New List" }).click();
    await page.getByLabel("New list name").fill("Work");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Work")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "New List" }).click();
    await page.getByLabel("New list name").fill("Personal");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Personal")).toBeVisible({ timeout: 5_000 });

    // Order should be: Inbox (0), Work (1), Personal (2)
    const listItems = page.locator("ul > li");
    await expect(listItems).toHaveCount(3);
    await expect(listItems.nth(0)).toContainText("Inbox");
    await expect(listItems.nth(1)).toContainText("Work");
    await expect(listItems.nth(2)).toContainText("Personal");

    // Move Personal up — it should swap with Work
    await page.getByLabel("Move Personal up").click();

    // Wait for reorder to settle
    await expect(listItems.nth(1)).toContainText("Personal", { timeout: 5_000 });
    await expect(listItems.nth(2)).toContainText("Work");

    // Screenshot: after reorder
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-after-reorder.png`,
    });

    // Refresh and verify order persists
    await page.reload();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });

    const refreshedItems = page.locator("ul > li");
    await expect(refreshedItems).toHaveCount(3);
    await expect(refreshedItems.nth(0)).toContainText("Inbox");
    await expect(refreshedItems.nth(1)).toContainText("Personal");
    await expect(refreshedItems.nth(2)).toContainText("Work");

    // Move Inbox down — it should swap with Personal
    await page.getByLabel("Move Inbox down").click();
    await expect(refreshedItems.nth(0)).toContainText("Personal", { timeout: 5_000 });
    await expect(refreshedItems.nth(1)).toContainText("Inbox");

    // Verify up button is disabled for the first item
    await expect(page.getByLabel("Move Personal up")).toBeDisabled();

    // Verify down button is disabled for the last item
    await expect(page.getByLabel("Move Work down")).toBeDisabled();
  });

  test("user can create a task in a list", async ({ page }, testInfo) => {
    const taskUser = `e2e-task-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(taskUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Navigate into Inbox
    await page.getByText("Inbox").click();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({
      timeout: 10_000,
    });

    // Should show empty state
    await expect(page.getByText("No tasks yet")).toBeVisible();

    // Screenshot: empty task list
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/tasks-empty.png`,
    });

    // Create a task
    await page.getByRole("button", { name: "New Task" }).click();
    await page.getByLabel("New task title").fill("Buy milk");
    await page.getByRole("button", { name: "Save" }).click();

    // Task should appear
    await expect(page.getByText("Buy milk")).toBeVisible({ timeout: 5_000 });

    // Create a second task
    await page.getByRole("button", { name: "New Task" }).click();
    await page.getByLabel("New task title").fill("Walk the dog");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Walk the dog")).toBeVisible({ timeout: 5_000 });

    // Screenshot: tasks in list
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/tasks-created.png`,
    });

    // Verify tasks persist after refresh
    await page.reload();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Buy milk")).toBeVisible();
    await expect(page.getByText("Walk the dog")).toBeVisible();

    // Navigate back to lists
    await page.getByLabel("Back to lists").click();
    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("user can create a new list", async ({ page }, testInfo) => {
    // Register a fresh user
    const listUser = `e2e-list-${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Username").fill(listUser);
    await page.getByRole("button", { name: "Register with passkey" }).click();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Inbox")).toBeVisible();

    // Should see only Inbox initially
    const listItems = page.locator("ul > li");
    await expect(listItems).toHaveCount(1);

    // Screenshot: before creating a list
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-before-create.png`,
    });

    // Tap "New List" button
    await page.getByRole("button", { name: "New List" }).click();

    // Fill in the list name
    await page.getByLabel("New list name").fill("Shopping");
    await page.getByRole("button", { name: "Save" }).click();

    // New list should appear alongside Inbox
    await expect(page.getByText("Shopping")).toBeVisible({ timeout: 5_000 });
    await expect(listItems).toHaveCount(2);

    // Screenshot: after creating a list
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-after-create.png`,
    });

    // Create a second list to confirm position ordering
    await page.getByRole("button", { name: "New List" }).click();
    await page.getByLabel("New list name").fill("Work");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Work")).toBeVisible({ timeout: 5_000 });
    await expect(listItems).toHaveCount(3);

    // Screenshot: three lists
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}/lists-three-lists.png`,
    });
  });
});
