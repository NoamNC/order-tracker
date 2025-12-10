import { expect, test } from "@playwright/test";

test("lookup flow shows error for wrong zip", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel(/Order number/i).fill("A12345");
	await page.getByLabel(/ZIP/i).fill("00000");
	await page.getByRole("button", { name: /view order/i }).click();
	await expect(page.getByRole("alert")).toContainText(/not found|zip code/i);
});

// NOTE: This test is intentionally minimal. In the challenge, ask candidates to make E2E stable & data-driven.
