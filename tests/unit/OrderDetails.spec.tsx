import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Order } from "@/types/order";
import OrderDetails from "@/routes/OrderDetails";

describe("OrderDetails", () => {
	it("renders ParcelSummary only once when ZIP is missing (multiple shipments)", () => {
		const orders: Order[] = [
			{
				_id: "shipment-1",
				courier: "dhl",
				tracking_number: "TRACK-1",
				created: "2023-01-01T00:00:00Z",
				updated: "2023-01-02T00:00:00Z",
				delivery_info: {
					orderNo: "ORDER-123",
					timezone: "UTC",
					// No articles when ZIP isn't provided (sanitized response)
					articles: undefined,
				},
				checkpoints: [],
			},
			{
				_id: "shipment-2",
				courier: "ups",
				tracking_number: "TRACK-2",
				created: "2023-01-01T00:00:00Z",
				updated: "2023-01-02T00:00:00Z",
				delivery_info: {
					orderNo: "ORDER-123",
					timezone: "UTC",
					articles: undefined,
				},
				checkpoints: [],
			},
		];

		render(
			<MemoryRouter
				initialEntries={[
					{
						pathname: "/order/ORDER-123",
						state: {
							orders,
							hasZip: false,
						},
					},
				]}
			>
				<Routes>
					<Route path="/order/:id" element={<OrderDetails />} />
				</Routes>
			</MemoryRouter>,
		);

		// When ZIP is missing, ParcelSummary renders a ZIP prompt. This should appear once.
		expect(
			screen.getAllByText("Enter your ZIP code to view package contents."),
		).toHaveLength(1);
	});
});
