import { HttpResponse, http } from "msw";
import type { Order } from "@/types/order";
import shipmentsData from "../../data/shipments.json";

const shipments = shipmentsData as unknown as Order[];

export const handlers = [
	http.get("/orders/:orderNumber", ({ params, request }) => {
		const { orderNumber } = params as { orderNumber: string };
		const url = new URL(request.url);
		const zip = url.searchParams.get("zip");
		const match = shipments.filter(
			(o) => o.delivery_info?.orderNo === orderNumber,
		);
		if (match.length === 0) {
			return HttpResponse.text("Order not found", { status: 404 });
		}
		if (zip) {
			const zipMatches = match
				.filter((o) => o.zip_code === zip)
				.sort((a, b) => a._id.localeCompare(b._id));
			if (zipMatches.length === 0) {
				return HttpResponse.text("ZIP mismatch", { status: 403 });
			}
			return HttpResponse.json(zipMatches, { status: 200 });
		}

		return HttpResponse.json(match, { status: 200 });
	}),
];
