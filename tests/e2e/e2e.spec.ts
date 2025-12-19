import { expect, test } from "@playwright/test";

test("lookup flow shows error for wrong zip", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel(/Order number/i).fill("A12345");
	await page.getByLabel(/ZIP/i).fill("00000");
	await page.getByRole("button", { name: /view order/i }).click();
	await expect(page.getByRole("alert")).toContainText(/not found|zip code/i);
});

test("lookup flow works without ZIP code", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel(/Order number/i).fill("0000RTAB1");
	// Don't fill ZIP code
	await page.getByRole("button", { name: /view order/i }).click();
	
	// Should navigate to order details page
	await expect(page).toHaveURL(/\/order\/0000RTAB1/);
	
	// Should show basic tracking information
	await expect(page.getByText(/Order Tracking/i)).toBeVisible();
	await expect(page.getByText("0000RTAB1")).toBeVisible();
	
	// Should NOT show sensitive information (ZIP-gated sections should show placeholders instead)
	await expect(page.getByText(/Recipient/i)).not.toBeVisible();
	await expect(page.getByText(/Delivery Address/i)).not.toBeVisible();
	await expect(
		page.getByText(/Enter your ZIP code to view package contents\./i),
	).toBeVisible();
});

test("lookup flow works with ZIP code and shows full information", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel(/Order number/i).fill("0000RTAB1");
	await page.getByLabel(/ZIP/i).fill("60156");
	await page.getByRole("button", { name: /view order/i }).click();
	
	// Should navigate to order details page (ZIP stored in sessionStorage, not URL)
	await expect(page).toHaveURL(/\/order\/0000RTAB1/);
	
	// Should show full information including sensitive data
	await expect(page.getByText(/Order Tracking/i)).toBeVisible();
	await expect(page.getByText("0000RTAB1")).toBeVisible();
	await expect(page.getByText(/Recipient/i)).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /package contents/i }).first(),
	).toBeVisible();
	await expect(page.getByText(/Delivery Address/i)).toBeVisible();
});

test("direct URL access without ZIP shows limited information", async ({ page }) => {
	// Navigate directly to order details page without ZIP
	await page.goto("/order/0000RTAB1");
	
	// Should show basic tracking information
	await expect(page.getByText(/Order Tracking/i)).toBeVisible();
	await expect(page.getByText("0000RTAB1")).toBeVisible();
	
	// Should NOT show sensitive information
	await expect(page.getByText(/Recipient/i)).not.toBeVisible();
	await expect(page.getByText(/Delivery Address/i)).not.toBeVisible();
	await expect(
		page.getByText(/Enter your ZIP code to view package contents\./i),
	).toBeVisible();
});

test("direct URL access with ZIP in sessionStorage shows full information", async ({ page }) => {
	// Set ZIP in sessionStorage before navigating
	await page.goto("/order/0000RTAB1");
	await page.evaluate(() => {
		sessionStorage.setItem("zip:0000RTAB1", "60156");
	});
	// Reload to trigger fetch with ZIP from sessionStorage
	await page.reload();
	
	// Should show full information including sensitive data
	await expect(page.getByText(/Order Tracking/i)).toBeVisible();
	await expect(page.getByText("0000RTAB1")).toBeVisible();
	await expect(page.getByText(/Recipient/i)).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /package contents/i }).first(),
	).toBeVisible();
	await expect(page.getByText(/Delivery Address/i)).toBeVisible();
});

// NOTE: This test is intentionally minimal. In the challenge, ask candidates to make E2E stable & data-driven.
