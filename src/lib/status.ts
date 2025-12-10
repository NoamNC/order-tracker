import type { Checkpoint } from "@/types/order";

import type { DeliveryInfo } from "@/types/order";

export type ComputedStatus =
	| { code: "delivered"; label: "Delivered" }
	| { code: "ready_for_collection"; label: "Ready for collection" }
	| { code: "failed_attempt"; label: "Action required" }
	| { code: "scheduled"; label: "Delivery scheduled" }
	| { code: "out_for_delivery"; label: "Out for Delivery" }
	| { code: "in_transit"; label: "In transit" }
	| { code: "delayed"; label: "Delayed" };

function normalize(text?: string) {
	return text?.toLowerCase() ?? "";
}

function buildStatusFromDueDate(
	deliveryDate: string | undefined,
	now: Date,
): ComputedStatus | null {
	if (!deliveryDate) {
		return null;
	}

	const due = new Date(deliveryDate);
	if (Number.isNaN(due.getTime())) {
		return null;
	}

	if (due.getTime() < now.getTime()) {
		return { code: "delayed", label: "Delayed" };
	}

	return { code: "scheduled", label: "Delivery scheduled" };
}

export function computeStatus(
	checkpoints: Checkpoint[],
	deliveryInfo?: DeliveryInfo,
): ComputedStatus {
	const now = new Date();
	const sorted = [...checkpoints].sort(
		(a, b) =>
			new Date(b.event_timestamp).getTime() -
			new Date(a.event_timestamp).getTime(),
	);
	const latest = sorted[0];
	const announcedDate = deliveryInfo?.announced_delivery_date;

	if (!latest) {
		return (
			buildStatusFromDueDate(announcedDate, now) ?? {
				code: "in_transit",
				label: "In transit",
			}
		);
	}

	const latestText = normalize(
		`${latest.status} ${latest.status_details ?? ""}`,
	);
	const latestDeliveryDate = latest.meta?.delivery_date ?? announcedDate;

	// Delivered is terminal and beats every other signal.
	if (latestText.includes("delivered")) {
		return { code: "delivered", label: "Delivered" };
	}

	if (latestText.includes("collection") || latestText.includes("pickup")) {
		return { code: "ready_for_collection", label: "Ready for collection" };
	}

	if (latestText.includes("failed") || latestText.includes("attempt")) {
		return { code: "failed_attempt", label: "Action required" };
	}

	if (latestText.includes("delay")) {
		return { code: "delayed", label: "Delayed" };
	}
	if (
		latestText.includes("out for delivery") ||
		latestText.includes("on the way to you") ||
		latestText.includes("on its way to recipient")
	) {
		return { code: "out_for_delivery", label: "Out for Delivery" };
	}

	if (
		latestText.includes("schedule") ||
		latestText.includes("delivery date set") ||
		latestText.includes("estimated delivery")
	) {
		const scheduled = buildStatusFromDueDate(latestDeliveryDate, now);
		return scheduled ?? { code: "scheduled", label: "Delivery scheduled" };
	}

	const statusFromDueDate = buildStatusFromDueDate(latestDeliveryDate, now);
	if (statusFromDueDate) {
		return statusFromDueDate;
	}

	return { code: "in_transit", label: "In transit" };
}
