import { describe, expect, it } from "vitest";
import { relativeDayLabel } from "@/lib/format";

describe("relativeDayLabel", () => {
	it("respects timezone parameter", () => {
		const iso = "2025-10-30T00:30:00Z";
		const now = new Date("2025-10-30T12:00:00Z");
		const label = relativeDayLabel(iso, "America/Chicago", now);
		expect(label).toBe("yesterday");
	});
});
