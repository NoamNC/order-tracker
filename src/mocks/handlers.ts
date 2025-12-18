import { HttpResponse, http } from "msw";
import type { Order } from "@/types/order";
import shipmentsData from "../../data/shipments.json";

const shipments = shipmentsData as unknown as Order[];

/**
 * Sanitizes order data by removing sensitive information when ZIP is not provided.
 * Returns only basic tracking information.
 */
function sanitizeOrderForZipLessLookup(order: Order): Order {
	return {
		...order,
		delivery_info: {
			...order.delivery_info,
			// Remove sensitive recipient information
			recipient: undefined,
			recipient_notification: undefined,
			email: undefined,
			street: undefined,
			// Remove articles (package contents)
			articles: undefined,
		},
	};
}

export const handlers = [
	http.get("/orders/:orderNumber", ({ params, request }) => {
		const { orderNumber } = params as { orderNumber: string };
		const url = new URL(request.url);
		const zip = url.searchParams.get("zip")?.trim();
		const match = shipments.filter(
			(o) => o.delivery_info?.orderNo === orderNumber,
		);
		if (match.length === 0) {
			return HttpResponse.text("Order not found", { status: 404 });
		}
		if (zip && zip.length > 0) {
			const zipMatches = match
				.filter((o) => o.zip_code === zip)
				.sort((a, b) => a._id.localeCompare(b._id));
			if (zipMatches.length === 0) {
				return HttpResponse.text("ZIP mismatch", { status: 403 });
			}
			return HttpResponse.json(zipMatches, { status: 200 });
		}

		// No ZIP provided - return sanitized basic tracking information
		const sanitized = match
			.map(sanitizeOrderForZipLessLookup)
			.sort((a, b) => a._id.localeCompare(b._id));
		return HttpResponse.json(sanitized, { status: 200 });
	}),
];
