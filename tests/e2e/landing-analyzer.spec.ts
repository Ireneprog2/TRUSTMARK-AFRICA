import { expect, test } from "@playwright/test";

test("landing page leads into a transparent message check", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TrustMark Africa" })).toBeVisible();
  await page.getByRole("link", { name: "Check a message" }).first().click();
  await expect(page.getByRole("heading", { name: "Analyze a message" })).toBeVisible();
  await page.getByLabel("Message to review").fill("Urgent: send your OTP and password now.");
  await page.getByRole("button", { name: "Check message" }).click();
  await expect(page.getByText("HIGH risk")).toBeVisible();
  await expect(page.getByText("This is a limited keyword-based screen, not an AI verdict or probability.")).toBeVisible();
});