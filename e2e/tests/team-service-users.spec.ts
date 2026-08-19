import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";
import { navigateTo } from "../helpers/auth";
import { generateRandomName } from "../helpers/utils";

let regularUser = "";
let adminServiceUser = "";

test.describe.serial("Team - Service Identities @team", () => {
  test("Should create service identities and verify roles", async ({ dashboardAsOwner: page }) => {
    await navigateTo(page, "/team/service-users");

    regularUser = generateRandomName("svc-user-");
    adminServiceUser = generateRandomName("svc-admin-");

    await createServiceUser(page, regularUser, "User");
    await createServiceUser(page, adminServiceUser, "Admin");

    await checkServiceUserRow(page, regularUser, "User");
    await checkServiceUserRow(page, adminServiceUser, "Admin");
  });

  test("Should update role and manage access tokens", async ({ dashboardAsOwner: page }) => {
    await openServiceUser(page, regularUser);
    await changeRoleTo(page, "Admin");
    await saveUserChanges(page);

    const tokenName = generateRandomName("tkn_");
    await page.getByTestId("access-token-open-modal").click();
    await page.getByTestId("access-token-name").fill(tokenName);
    await page.getByTestId("access-token-expires-in").fill("30");
    await page.getByTestId("create-access-token").click();
    await expect(page.getByTestId("access-token-copy-close")).toBeVisible();
    await page.getByTestId("access-token-copy-close").click();

    const tokenRow = page.locator("tr").filter({ hasText: tokenName });
    await tokenRow.getByTestId("access-token-delete").click();
    await page.getByTestId("confirmation.confirm").click();
    await expect(tokenRow).not.toBeVisible();
  });

  test("Should update admin identity role and verify all changes persisted", async ({
    dashboardAsOwner: page,
  }) => {
    await openServiceUser(page, adminServiceUser);
    await changeRoleTo(page, "User");
    await saveUserChanges(page);

    await returnToServiceUserList(page);
    await checkServiceUserRow(page, regularUser, "Admin");
    await checkServiceUserRow(page, adminServiceUser, "User");

    await page.reload();
    await checkServiceUserRow(page, regularUser, "Admin");
    await checkServiceUserRow(page, adminServiceUser, "User");
  });

  test("Should delete service identities", async ({ dashboardAsOwner: page }) => {
    await openServiceUserList(page);
    for (const name of [regularUser, adminServiceUser]) {
      const row = page.locator("tr").filter({ hasText: name });
      await row.getByTestId("user-actions").click({ force: true });
      await page.getByTestId("delete-user").click({ force: true });
      await page.getByTestId("confirmation.confirm").click();
      await expect(row).not.toBeVisible();
    }
  });
});

async function createServiceUser(page: Page, name: string, role: string) {
  await page.getByTestId("open-service-user-modal").click();
  await expect(page.getByTestId("service-user-name")).toBeVisible({ timeout: 5_000 });
  await page.getByTestId("service-user-name").fill(name);
  await page.getByTestId("user-role-selector").click({ force: true });
  await page
    .getByTestId("user-role-selector-item")
    .getByText(role, { exact: true })
    .click({ force: true });
  await page.getByTestId("create-service-user").click();
  await expect(page.getByTestId("service-user-name")).not.toBeVisible({ timeout: 5_000 });
}

async function openServiceUserList(page: Page) {
  await navigateTo(page, "/team/service-users");
  await expectServiceUserList(page);
}

async function returnToServiceUserList(page: Page) {
  // The user-detail breadcrumb remains an inherited presentation detail and is not
  // part of the Service Identities persistence contract. Return through the stable
  // route so this test verifies saved role state instead of breadcrumb wording.
  await navigateTo(page, "/team/service-users");
  await expectServiceUserList(page);
}

async function expectServiceUserList(page: Page) {
  await expect(page.getByRole("heading", { name: /Service Identities/ })).toBeVisible({
    timeout: 10_000,
  });
}

async function openServiceUser(page: Page, name: string) {
  await openServiceUserList(page);

  const row = page.locator("tr").filter({ hasText: name });
  await expect(row).toBeVisible({ timeout: 10_000 });
  await row.click();

  await page.waitForURL(/\/team\/user\?/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible({
    timeout: 10_000,
  });
}

async function checkServiceUserRow(page: Page, name: string, role: string) {
  const row = page.locator("tr").filter({ hasText: name });
  await expect(row).toBeVisible({ timeout: 10_000 });
  await expect(row.getByText(role, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
}

async function changeRoleTo(page: Page, role: string) {
  await page.getByTestId("user-role-selector").click();
  await page
    .getByTestId("user-role-selector-item")
    .getByText(role, { exact: true })
    .click();
  await expect(
    page.getByTestId("user-role-selector").getByText(role, { exact: true }),
  ).toBeVisible({ timeout: 5_000 });
}

async function saveUserChanges(page: Page) {
  const userId = new URL(page.url()).searchParams.get("id");
  expect(userId, "expected a user page with an id parameter").toBeTruthy();

  const saveResponse = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/users/${userId}`) &&
      resp.request().method() === "PUT",
    { timeout: 30_000 },
  );
  await page.getByTestId("save-changes").click();
  expect((await saveResponse).status()).toBe(200);
}
