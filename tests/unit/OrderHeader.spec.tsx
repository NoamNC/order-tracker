import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderHeader } from "@/components/OrderHeader";
import type { Order } from "@/types/order";

describe("OrderHeader", () => {
	const baseOrder: Order = {
		_id: "1",
		created: "2023-01-01T00:00:00Z",
		updated: "2023-01-02T14:10:30Z",
		tracking_number: "AB20221219",
		courier: "dhl",
		destination_country_iso3: "USA",
		delivery_info: {
			orderNo: "0000RTAB1",
			recipient: "Ollie Wright",
			email: "oliver.wright@parcellab.com",
			timezone: "America/Chicago",
		},
		checkpoints: [
			{
				status_details: "Your package was registered",
				event_timestamp: "2023-01-02T14:10:30Z",
				status: "Registered",
				country_iso3: "USA",
				city: "Knoxville",
			},
		],
	};

	it("displays basic order information", () => {
		render(<OrderHeader orders={[baseOrder]} />);

		expect(screen.getByText("Order Information")).toBeInTheDocument();
		expect(screen.getByText("0000RTAB1")).toBeInTheDocument();
		expect(screen.getByText("AB20221219")).toBeInTheDocument();
		expect(screen.getByText("DHL")).toBeInTheDocument();
	});

	it("displays recipient information when hasZip is true", () => {
		render(<OrderHeader orders={[baseOrder]} hasZip={true} />);

		expect(screen.getByText("Recipient")).toBeInTheDocument();
		expect(screen.getByText("Ollie Wright")).toBeInTheDocument();
		expect(screen.getByText("oliver.wright@parcellab.com")).toBeInTheDocument();
	});

	it("hides recipient information when hasZip is false", () => {
		render(<OrderHeader orders={[baseOrder]} hasZip={false} />);

		expect(screen.queryByText("Recipient")).not.toBeInTheDocument();
		expect(screen.queryByText("Ollie Wright")).not.toBeInTheDocument();
		expect(screen.queryByText("oliver.wright@parcellab.com")).not.toBeInTheDocument();
	});

	it("defaults to showing recipient information when hasZip is not provided", () => {
		render(<OrderHeader orders={[baseOrder]} />);

		expect(screen.getByText("Recipient")).toBeInTheDocument();
		expect(screen.getByText("Ollie Wright")).toBeInTheDocument();
	});

	it("still displays order number and tracking when hasZip is false", () => {
		render(<OrderHeader orders={[baseOrder]} hasZip={false} />);

		expect(screen.getByText("0000RTAB1")).toBeInTheDocument();
		expect(screen.getByText("AB20221219")).toBeInTheDocument();
		expect(screen.getByText("DHL")).toBeInTheDocument();
	});

	it("handles missing recipient information gracefully", () => {
		const orderWithoutRecipient: Order = {
			...baseOrder,
			delivery_info: {
				...baseOrder.delivery_info,
				recipient: undefined,
				email: undefined,
			},
		};

		render(<OrderHeader orders={[orderWithoutRecipient]} hasZip={true} />);

		expect(screen.queryByText("Recipient")).not.toBeInTheDocument();
		expect(screen.getByText("0000RTAB1")).toBeInTheDocument();
	});

	it("displays multiple tracking numbers when order has multiple shipments", () => {
		const secondOrder: Order = {
			_id: "2",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-02T14:10:30Z",
			tracking_number: "74328923203",
			courier: "ups",
			destination_country_iso3: "USA",
			delivery_info: baseOrder.delivery_info,
			checkpoints: [],
		};

		render(<OrderHeader orders={[baseOrder, secondOrder]} />);

		expect(screen.getByText("Tracking Numbers")).toBeInTheDocument();
		expect(screen.getByText("AB20221219")).toBeInTheDocument();
		expect(screen.getByText("74328923203")).toBeInTheDocument();
		expect(screen.getByText("DHL")).toBeInTheDocument();
		expect(screen.getByText("UPS")).toBeInTheDocument();
	});
});
