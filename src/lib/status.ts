import type { Checkpoint } from "@/types/order";

export type ComputedStatus =
	| { code: "delivered"; label: "Delivered" }
	| { code: "ready_for_collection"; label: "Ready for collection" }
	| { code: "failed_attempt"; label: "Action required" }
	| { code: "scheduled"; label: "Delivery scheduled" }
	| { code: "in_transit"; label: "In transit" }
	| { code: "delayed"; label: "Delayed" };

export function computeStatus(checkpoints: Checkpoint[]): ComputedStatus {
	const sorted = [...checkpoints].sort(
		(a, b) =>
			new Date(b.event_timestamp).getTime() -
			new Date(a.event_timestamp).getTime(),
	);
	const last = sorted[0];
	const status = last.status.toLowerCase();

	if (status.includes("transit")) {
		return { code: "in_transit", label: "In transit" };
	}
	if (status.includes("delivered")) {
		return { code: "delivered", label: "Delivered" };
	}

	return { code: "in_transit", label: "In transit" };
}
