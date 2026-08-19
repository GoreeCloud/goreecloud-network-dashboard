import { expect, test } from "../helpers/fixtures";
import { loginToApp, navigateTo } from "../helpers/auth";
import { deleteUserByEmail } from "../helpers/api";

test.setTimeout(60_000);

test.describe.serial("User Approval @team", () => {
  test("Should show approval pending for the second user", async ({
    browser,
    dashboardAsOwner: ownerPage,
  }) => {
    await deleteUserByEmail(ownerPage, "user@localhost.test");

    const context = await browser.newContext({
      storageState: "e2e/fixtures/auth/user.json",
    });
    const page = await context.newPage();
    await loginToApp(page, "user");
    await expect(page.getByText("User Approval Pending")).toBeVisible();
    await context.close();
  });

  test("Should approve the pending user", async ({
    dashboardAsOwner: page,
  }) => {
    await navigateTo(page, "/team/users");

    const pendingRow = page.locator("tr").filter({ hasText: "Pending" });
    await expect(pendingRow).toBeVisible();
    await pendingRow.getByRole("button", { name: "Approve" }).click();
    await expect(pendingRow).not.toBeVisible();
  });

  test("Should delete the approved user", async ({
    dashboardAsOwner: page,
  }) => {
    const userRow = page
      .locator("tr")
      .filter({ hasText: "user@localhost.test" });
    await expect(userRow).toBeVisible();
    await userRow.getByTestId("user-actions").click({ force: true });
    await page.getByTestId("delete-user").click({ force: true });
    await page.getByTestId("confirmation.confirm").click();
    await expect(userRow).not.toBeVisible();
  });
});
