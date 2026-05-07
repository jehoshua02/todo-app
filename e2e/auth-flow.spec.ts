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

    // Click the list name to start renaming
    await page.getByText("Old Name").click();

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

    // Verify Inbox cannot be renamed — clicking it should not produce a rename input
    await page.getByText("Inbox").click();
    await expect(page.getByLabel("Rename list")).not.toBeVisible();

    // Inbox should still be visible as text
    await expect(page.getByText("Inbox")).toBeVisible();
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
