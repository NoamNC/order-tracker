import type { Checkpoint, Order } from "@/types/order";
import { relativeDayLabel } from "@/lib/format";
import type { ComputedStatus } from "@/lib/status";

export interface StatusExplanation {
	nextAction: string;
	explanation: string;
}

function normalize(text?: string) {
	return text?.toLowerCase() ?? "";
}

function formatTime(timestamp: string, tz: string): string {
	const date = new Date(timestamp);
	return date.toLocaleString("en-US", {
		timeZone: tz,
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDate(dateString: string | undefined, tz: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		timeZone: tz,
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function getLatestCheckpoint(checkpoints: Checkpoint[]): Checkpoint | null {
	if (!checkpoints || checkpoints.length === 0) return null;
	const sorted = [...checkpoints].sort(
		(a, b) =>
			new Date(b.event_timestamp).getTime() -
			new Date(a.event_timestamp).getTime(),
	);
	return sorted[0]??null;
}

export function explainStatus(
	order: Order,
	status: ComputedStatus,
	now: Date = new Date(),
): StatusExplanation {
	const tz = order.delivery_info?.timezone ?? "UTC";
	const checkpoints = order.checkpoints ?? [];
	const latestCheckpoint = getLatestCheckpoint(checkpoints);
	const deliveryInfo = order.delivery_info;
	const announcedDate = deliveryInfo?.announced_delivery_date;
	const latestDeliveryDate =
		latestCheckpoint?.meta?.delivery_date ?? announcedDate;

	switch (status.code) {
		case "delivered": {
			const timeStr = latestCheckpoint
				? formatTime(latestCheckpoint.event_timestamp, tz)
				: "";
			const dateLabel = latestCheckpoint
				? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
				: "";
			return {
				nextAction: "No action required",
				explanation: latestCheckpoint
					? `Your package was delivered ${dateLabel} at ${timeStr}.`
					: "Your package has been delivered.",
			};
		}

		case "ready_for_collection": {
			const pickupAddress =
				latestCheckpoint?.meta?.pickup_address ??
				"the pickup location";
			const dateLabel = latestCheckpoint
				? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
				: "soon";
			return {
				nextAction: "Please collect your package",
				explanation: `Your package is ready for collection ${dateLabel} at ${pickupAddress}. Please bring a valid ID.`,
			};
		}

		case "failed_attempt": {
			const dateLabel = latestCheckpoint
				? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
				: "";
			const courier = order.courier?.toUpperCase() ?? "the carrier";
			return {
				nextAction: "Action required: Please contact carrier",
				explanation: `A delivery attempt failed ${dateLabel}. Please contact ${courier} to arrange a new delivery or collection.`,
			};
		}

		case "scheduled": {
			const deliveryDate = latestDeliveryDate ?? announcedDate;
			if (deliveryDate) {
				const dateLabel = relativeDayLabel(
					deliveryDate + "T12:00:00Z",
					tz,
					now,
				);
				const timeFrame =
					latestCheckpoint?.meta?.delivery_time_frame_from &&
					latestCheckpoint?.meta?.delivery_time_frame_to
						? ` between ${latestCheckpoint.meta.delivery_time_frame_from} and ${latestCheckpoint.meta.delivery_time_frame_to}`
						: "";
				const city = latestCheckpoint?.city ?? "";
				const timeStr = latestCheckpoint
					? formatTime(latestCheckpoint.event_timestamp, tz)
					: "";
				const dateLabelCheckpoint = latestCheckpoint
					? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
					: "";
				
				let explanation = `Your package is scheduled for delivery ${dateLabel}${timeFrame}.`;
				if (city && timeStr) {
					explanation += ` It departed from ${city} at ${timeStr}${dateLabelCheckpoint && dateLabelCheckpoint !== "today" ? ` ${dateLabelCheckpoint}` : ""}.`;
				} else if (city) {
					explanation += ` It departed from ${city}${dateLabelCheckpoint && dateLabelCheckpoint !== "today" ? ` ${dateLabelCheckpoint}` : ""}.`;
				}
				
				return {
					nextAction: `Expected delivery ${dateLabel}`,
					explanation,
				};
			}
			return {
				nextAction: "Delivery scheduled",
				explanation: "Your package has a scheduled delivery date.",
			};
		}

		case "delayed": {
			const originalDate = announcedDate
				? formatDate(announcedDate, tz)
				: "the expected date";
			const newDate = latestDeliveryDate
				? relativeDayLabel(latestDeliveryDate + "T12:00:00Z", tz, now)
				: "soon";
			return {
				nextAction: "Delivery delayed",
				explanation: `Your package was expected on ${originalDate} but has been delayed. New expected delivery: ${newDate}.`,
			};
		}

		case "out_for_delivery": {
			const city = latestCheckpoint?.city ?? "";
			const timeStr = latestCheckpoint
				? formatTime(latestCheckpoint.event_timestamp, tz)
				: "";
			const dateLabel = latestCheckpoint
				? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
				: "";
			const expectedDate = announcedDate
				? relativeDayLabel(announcedDate + "T12:00:00Z", tz, now)
				: null;

			let explanation = "";
			
			if (latestCheckpoint) {
				const statusText = normalize(latestCheckpoint.status_details);
				if (statusText.includes("depot") || statusText.includes("facility")) {
					explanation = `Your parcel departed ${city ? `from ${city}` : "the local depot"}${timeStr ? ` at ${timeStr}` : ""}${dateLabel !== "today" ? ` ${dateLabel}` : ""} and is out for delivery${expectedDate ? `. Expected delivery ${expectedDate}.` : " today."}`;
				} else {
					explanation = `Your package is out for delivery${city ? ` from ${city}` : ""}${timeStr ? ` (departed at ${timeStr})` : ""}${expectedDate ? `. Expected delivery ${expectedDate}.` : " today."}`;
				}
			} else {
				explanation = `Your package is out for delivery${expectedDate ? `. Expected delivery ${expectedDate}.` : " today."}`;
			}

			return {
				nextAction: expectedDate
					? `Expected delivery ${expectedDate}`
					: "Expected delivery today",
				explanation,
			};
		}

		case "in_transit": {
			const city = latestCheckpoint?.city ?? "";
			const timeStr = latestCheckpoint
				? formatTime(latestCheckpoint.event_timestamp, tz)
				: "";
			const dateLabel = latestCheckpoint
				? relativeDayLabel(latestCheckpoint.event_timestamp, tz, now)
				: "";
			const expectedDate = announcedDate
				? relativeDayLabel(announcedDate + "T12:00:00Z", tz, now)
				: null;

			let explanation = "";
			if (latestCheckpoint) {
				const statusText = normalize(latestCheckpoint.status_details);
				// Check for depot/facility patterns for better explanations
				if (statusText.includes("depot") || statusText.includes("facility") || statusText.includes("sorting center")) {
					const dayPart = dateLabel && dateLabel !== "today" ? ` ${dateLabel}` : "";
					explanation = `Your parcel departed ${city ? `from ${city}` : "the local depot"}${timeStr ? ` at ${timeStr}` : ""}${dayPart}${expectedDate ? ` and is expected ${expectedDate}` : ""}.`;
				} else if (statusText.includes("arrived") || statusText.includes("arrival")) {
					explanation = `Your package arrived${city ? ` in ${city}` : ""}${timeStr ? ` at ${timeStr}` : ""}${dateLabel && dateLabel !== "today" ? ` ${dateLabel}` : ""}${expectedDate ? `. Expected delivery: ${expectedDate}.` : "."}`;
				} else {
					explanation = `Your package is in transit${city ? ` from ${city}` : ""}${timeStr ? ` (last update: ${timeStr})` : ""}${expectedDate ? `. Expected delivery: ${expectedDate}.` : "."}`;
				}
			} else {
				explanation = `Your package is in transit${expectedDate ? `. Expected delivery: ${expectedDate}.` : "."}`;
			}

			return {
				nextAction: expectedDate
					? `Expected delivery ${expectedDate}`
					: "In transit",
				explanation,
			};
		}

		default:
			return {
				nextAction: "Tracking in progress",
				explanation: "Your package is being processed.",
			};
	}
}
