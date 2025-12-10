import { afterEach, describe, expect, it, vi } from "vitest";
import { explainStatus } from "@/lib/explainer";
import { computeStatus } from "@/lib/status";
import type { Order } from "@/types/order";

describe("explainStatus - evaluation harness", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("Case 1: Delivered package with timestamp", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-08T12:00:00Z"));

		const order: Order = {
			_id: "1",
			courier: "dhl",
			tracking_number: "AB20221219",
			created: "2023-01-01T08:20:30Z",
			updated: "2023-01-08T10:00:00Z",
			checkpoints: [
				{
					status: "Delivered",
					status_details: "Package delivered to recipient",
					event_timestamp: "2023-01-08T10:00:00Z",
					country_iso3: "USA",
					city: "Horsham",
				},
			],
			delivery_info: {
				timezone: "America/Chicago",
				recipient: "Ollie Wright",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toBe("No action required");
		expect(explanation.explanation).toContain("delivered");
		expect(explanation.explanation).toMatch(/today|yesterday/);
	});

	it("Case 2: Failed delivery attempt requiring user action", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-07T20:00:00Z"));

		const order: Order = {
			_id: "3",
			courier: "ups",
			tracking_number: "74328923203",
			created: "2023-01-05T10:10:30Z",
			updated: "2023-01-07T20:02:30Z",
			checkpoints: [
				{
					status: "Failed attempt",
					status_details:
						"Unfortunately, the goods could not be handed over. The goods are beeing forwarded to a pick-up location.",
					event_timestamp: "2023-01-07T18:12:30Z",
					country_iso3: "DEU",
					city: "Munich",
				},
			],
			delivery_info: {
				timezone: "Europe/Berlin",
				recipient: "Andrej Fritz",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toContain("Action required");
		expect(explanation.nextAction).toContain("contact");
		expect(explanation.explanation).toContain("UPS");
		expect(explanation.explanation).toContain("failed");
	});

	it("Case 3: In transit with expected delivery date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-02T14:00:00Z"));

		const order: Order = {
			_id: "1",
			courier: "dhl",
			tracking_number: "AB20221219",
			created: "2023-01-01T08:20:30Z",
			updated: "2023-01-02T14:10:30Z",
			checkpoints: [
				{
					status: "In transit",
					status_details: "Your package is loaded and in transit to your area.",
					event_timestamp: "2023-01-02T14:10:30Z",
					country_iso3: "USA",
					city: "Knoxville",
				},
			],
			delivery_info: {
				timezone: "America/Chicago",
				// No announced_delivery_date to ensure status is "in_transit" not "scheduled"
				recipient: "Ollie Wright",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toMatch(/In transit|Expected delivery/);
		expect(explanation.explanation).toMatch(/in transit|Knoxville/);
	});

	it("Case 4: Scheduled delivery with time frame", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-22T10:00:00Z"));

		const order: Order = {
			_id: "2",
			courier: "dhl",
			tracking_number: "AB202212222",
			created: "2023-01-20T06:20:30Z",
			updated: "2023-01-22T13:10:30Z",
			checkpoints: [
				{
					status: "New delivery date set",
					status_details:
						"A new delivery date has been estimated for your shippment.",
					meta: {
						delivery_date: "2023-01-25",
						delivery_time_frame_from: "10:00",
						delivery_time_frame_to: "11:30",
					},
					event_timestamp: "2023-01-22T08:18:30Z",
					country_iso3: "USA",
					city: "Knoxville",
				},
			],
			delivery_info: {
				timezone: "America/Chicago",
				announced_delivery_date: "2023-01-26",
				recipient: "Ollie Wright",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toContain("Expected delivery");
		expect(explanation.explanation).toContain("scheduled");
		expect(explanation.explanation).toContain("10:00");
		expect(explanation.explanation).toContain("11:30");
		expect(explanation.explanation).toContain("Knoxville");
	});

	it("Case 5: Ready for collection with pickup address", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-07T20:00:00Z"));

		const order: Order = {
			_id: "3",
			courier: "ups",
			tracking_number: "74328923203",
			created: "2023-01-05T10:10:30Z",
			updated: "2023-01-07T20:02:30Z",
			checkpoints: [
				{
					status: "Ready for collection",
					status_details:
						"The goods will be ready for collection on the next working day.",
					meta: {
						pickup_address: "Kurfürstenplatz 8, 80796 München",
					},
					event_timestamp: "2023-01-07T20:02:30Z",
					country_iso3: "DEU",
					city: "Munich",
				},
			],
			delivery_info: {
				timezone: "Europe/Berlin",
				recipient: "Andrej Fritz",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toContain("collect");
		expect(explanation.explanation).toContain("ready for collection");
		expect(explanation.explanation).toContain("Kurfürstenplatz");
		expect(explanation.explanation).toContain("valid ID");
	});

	it("Case 6: Delayed delivery with new expected date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-10T12:00:00Z"));

		const order: Order = {
			_id: "4",
			courier: "dhl",
			tracking_number: "712334434444",
			created: "2023-01-05T10:10:30Z",
			updated: "2023-01-08T20:02:30Z",
			checkpoints: [
				{
					status: "Registered",
					status_details: "Your package was registered in our system by the sender.",
					event_timestamp: "2023-01-05T14:13:30Z",
					country_iso3: "DEU",
					city: "Hamburg",
				},
				{
					status: "Delay",
					status_details: "Delivery has been delayed due to weather conditions.",
					meta: {
						delivery_date: "2023-01-12",
					},
					event_timestamp: "2023-01-08T20:02:30Z",
					country_iso3: "DEU",
					city: "Hamburg",
				},
			],
			delivery_info: {
				timezone: "Europe/Berlin",
				announced_delivery_date: "2023-01-07",
				recipient: "Andrej Fritz",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(explanation.nextAction).toContain("delayed");
		expect(explanation.explanation).toContain("delayed");
		expect(explanation.explanation).toContain("expected");
		expect(explanation.explanation).toMatch(/Jan|2023-01-07/);
	});

	it("Case 7: Out for delivery with depot departure", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-08T10:00:00Z"));

		const order: Order = {
			_id: "5",
			courier: "dhl",
			tracking_number: "AB20221219",
			created: "2023-01-05T08:20:30Z",
			updated: "2023-01-08T08:12:00Z",
			checkpoints: [
				{
					status: "Out for delivery",
					status_details: "Your package left the local depot and is out for delivery",
					event_timestamp: "2023-01-08T08:12:00Z",
					country_iso3: "USA",
					city: "Horsham",
				},
			],
			delivery_info: {
				timezone: "America/Chicago",
				announced_delivery_date: "2023-01-08",
				recipient: "Ollie Wright",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(status.code).toBe("out_for_delivery");
		expect(explanation.nextAction).toMatch(/Expected delivery|today/);
		expect(explanation.explanation).toContain("out for delivery");
		expect(explanation.explanation).toMatch(/depot|Horsham|08:12/);
	});

	it("Case 8: In transit with depot departure and expected date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-07T14:00:00Z"));

		const order: Order = {
			_id: "6",
			courier: "ups",
			tracking_number: "1Z999AA10123456784",
			created: "2023-01-05T10:10:30Z",
			updated: "2023-01-07T08:15:00Z",
			checkpoints: [
				{
					status: "In transit",
					status_details: "Package left the sorting facility",
					event_timestamp: "2023-01-07T08:15:00Z",
					country_iso3: "USA",
					city: "Atlanta",
				},
			],
			delivery_info: {
				timezone: "America/New_York",
				announced_delivery_date: "2023-01-09",
				recipient: "John Doe",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(status.code).toBe("in_transit");
		expect(explanation.explanation).toMatch(/depot|facility|Atlanta/);
		expect(explanation.explanation).toContain("expected");
	});

	it("Case 9: Out for delivery today without expected date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-08T09:00:00Z"));

		const order: Order = {
			_id: "7",
			courier: "fedex",
			tracking_number: "1234567890",
			created: "2023-01-07T10:00:00Z",
			updated: "2023-01-08T07:30:00Z",
			checkpoints: [
				{
					status: "On the way to you",
					status_details: "Your package is on its way to recipient",
					event_timestamp: "2023-01-08T07:30:00Z",
					country_iso3: "USA",
					city: "New York",
				},
			],
			delivery_info: {
				timezone: "America/New_York",
				recipient: "Jane Smith",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(status.code).toBe("out_for_delivery");
		expect(explanation.nextAction).toContain("today");
		expect(explanation.explanation).toContain("out for delivery");
	});

	it("Case 10: Scheduled delivery with depot departure details", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2023-01-23T10:00:00Z"));

		const order: Order = {
			_id: "8",
			courier: "dhl",
			tracking_number: "AB202212222",
			created: "2023-01-20T06:20:30Z",
			updated: "2023-01-23T08:18:30Z",
			checkpoints: [
				{
					status: "New delivery date set",
					status_details: "A new delivery date has been estimated for your shipment.",
					meta: {
						delivery_date: "2023-01-25",
						delivery_time_frame_from: "14:00",
						delivery_time_frame_to: "16:00",
					},
					event_timestamp: "2023-01-23T08:18:30Z",
					country_iso3: "USA",
					city: "Knoxville",
				},
			],
			delivery_info: {
				timezone: "America/Chicago",
				announced_delivery_date: "2023-01-25",
				recipient: "Ollie Wright",
			},
		};

		const status = computeStatus(order.checkpoints ?? [], order.delivery_info);
		const explanation = explainStatus(order, status);

		expect(status.code).toBe("scheduled");
		expect(explanation.nextAction).toContain("Expected delivery");
		expect(explanation.explanation).toContain("scheduled");
		expect(explanation.explanation).toContain("14:00");
		expect(explanation.explanation).toContain("16:00");
		expect(explanation.explanation).toContain("Knoxville");
	});
});
