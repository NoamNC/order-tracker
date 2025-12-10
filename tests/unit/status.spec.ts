import { describe, expect, it } from "vitest";
import { computeStatus } from "@/lib/status";
import type { Checkpoint } from "@/types/order";

describe("computeStatus", () => {
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
});
