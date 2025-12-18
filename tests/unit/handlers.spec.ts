import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { handlers } from "@/mocks/handlers";
import type { Order } from "@/types/order";

const server = setupServer(...handlers);

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});

describe("API Handlers - ZIP and ZIP-less lookups", () => {
	it("returns full order data when ZIP is provided and matches", async () => {
		const response = await fetch("/orders/0000RTAB1?zip=60156");
		expect(response.ok).toBe(true);
		
		const orders = (await response.json()) as Order[];
		expect(orders.length).toBeGreaterThan(0);
		
		const order = orders[0];
		expect(order).toBeDefined();
		expect(order!.delivery_info?.orderNo).toBe("0000RTAB1");
		expect(order!.delivery_info?.recipient).toBeDefined();
		expect(order!.delivery_info?.articles).toBeDefined();
		expect(order!.delivery_info?.street).toBeDefined();
	});

	it("returns 403 when ZIP is provided but does not match", async () => {
		const response = await fetch("/orders/0000RTAB1?zip=00000");
		expect(response.status).toBe(403);
		expect(await response.text()).toBe("ZIP mismatch");
	});

	it("returns sanitized order data when ZIP is not provided", async () => {
		const response = await fetch("/orders/0000RTAB1");
		expect(response.ok).toBe(true);
		
		const orders = (await response.json()) as Order[];
		expect(orders.length).toBeGreaterThan(0);
		
		const order = orders[0];
		expect(order).toBeDefined();
		expect(order!.delivery_info?.orderNo).toBe("0000RTAB1");
		expect(order!.tracking_number).toBeDefined();
		expect(order!.checkpoints).toBeDefined();
		
		// Sensitive data should be removed
		expect(order!.delivery_info?.recipient).toBeUndefined();
		expect(order!.delivery_info?.email).toBeUndefined();
		expect(order!.delivery_info?.street).toBeUndefined();
		expect(order!.delivery_info?.articles).toBeUndefined();
	});

	it("returns 404 when order is not found", async () => {
		const response = await fetch("/orders/NONEXISTENT");
		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Order not found");
	});

	it("returns 404 when order is not found even without ZIP", async () => {
		const response = await fetch("/orders/NONEXISTENT");
		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Order not found");
	});

	it("preserves basic tracking information in ZIP-less lookup", async () => {
		const response = await fetch("/orders/0000RTAB1");
		expect(response.ok).toBe(true);
		
		const orders = (await response.json()) as Order[];
		const order = orders[0];
		expect(order).toBeDefined();
		
		// Basic tracking info should be preserved
		expect(order!._id).toBeDefined();
		expect(order!.tracking_number).toBeDefined();
		expect(order!.courier).toBeDefined();
		expect(order!.checkpoints).toBeDefined();
		expect(order!.delivery_info?.orderNo).toBeDefined();
		expect(order!.delivery_info?.timezone).toBeDefined();
		expect(order!.delivery_info?.announced_delivery_date).toBeDefined();
	});
});

