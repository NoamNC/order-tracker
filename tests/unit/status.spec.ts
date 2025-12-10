import { afterEach, describe, expect, it, vi } from "vitest";
import { computeStatus } from "@/lib/status";
import type { Checkpoint } from "@/types/order";

describe("computeStatus", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("detects In transit", () => {
		const cps: Checkpoint[] = [
			{
				status: "In transit",
				status_details: "",
				event_timestamp: "2023-01-01T00:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("in_transit");
	});

	it("detects delivered", () => {
		const cps: Checkpoint[] = [
			{
				status: "Delivered",
				status_details: "",
				event_timestamp: "2023-01-01T00:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("delivered");
	});

	it("detects ready for collection", () => {
		const cps: Checkpoint[] = [
			{
				status: "In transit",
				status_details: "",
				event_timestamp: "2023-01-01T00:00:00Z",
			},
			{
				status: "Ready for collection",
				status_details: "Pickup at local shop",
				event_timestamp: "2023-01-02T00:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("ready_for_collection");
	});

	it("detects failed attempt", () => {
		const cps: Checkpoint[] = [
			{
				status: "Failed delivery attempt",
				status_details: "",
				event_timestamp: "2023-01-02T00:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("failed_attempt");
	});

	it("detects scheduled deliveries using future delivery date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-05T00:00:00Z"));

		const cps: Checkpoint[] = [
			{
				status: "New delivery date set",
				status_details: "",
				meta: {
					delivery_date: "2023-01-10",
				},
				event_timestamp: "2023-01-04T00:00:00Z",
			},
		];

		expect(computeStatus(cps).code).toBe("scheduled");
	});

	it("marks orders as delayed when due date has passed", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-10T00:00:00Z"));

		const cps: Checkpoint[] = [
			{
				status: "Registered",
				status_details: "Package registered",
				event_timestamp: "2023-01-05T00:00:00Z",
			},
		];

		expect(
			computeStatus(cps, { announced_delivery_date: "2023-01-07" }).code,
		).toBe("delayed");
	});

	it("detects out for delivery", () => {
		const cps: Checkpoint[] = [
			{
				status: "Out for delivery",
				status_details: "Your package is out for delivery",
				event_timestamp: "2023-01-08T08:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("out_for_delivery");
	});

	it("detects out for delivery from status details", () => {
		const cps: Checkpoint[] = [
			{
				status: "In transit",
				status_details: "Your package is out for delivery to recipient",
				event_timestamp: "2023-01-08T08:00:00Z",
			},
		];
		expect(computeStatus(cps).code).toBe("out_for_delivery");
	});
});
