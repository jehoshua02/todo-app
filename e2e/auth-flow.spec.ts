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
  }) => {
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
    await page.screenshot({ path: "e2e/screenshots/lists-after-register.png" });

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
    await page.screenshot({ path: "e2e/screenshots/lists-after-login.png" });
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

  test("registering a duplicate username shows an error", async ({ page }) => {
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
      path: "e2e/screenshots/register-duplicate-error.png",
    });
  });

  test("logging in with an unknown username shows an error", async ({
    page,
  }) => {
    const unknownUser = `e2e-unknown-${Date.now()}`;
    await page.goto("/login");
    await page.getByLabel("Username").fill(unknownUser);
    await page.getByRole("button", { name: "Sign in with passkey" }).click();

    // Should show an error and stay on the login page
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.screenshot({
      path: "e2e/screenshots/login-unknown-error.png",
    });
  });
});
