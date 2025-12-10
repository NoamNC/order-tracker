import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeliveryEstimate } from "@/components/DeliveryEstimate";
import type { Order } from "@/types/order";

describe("DeliveryEstimate", () => {
	const baseOrder: Order = {
		_id: "1",
		created: "2023-01-01T00:00:00Z",
		updated: "2023-01-02T14:10:30Z",
		delivery_info: {
			announced_delivery_date: "2023-01-05",
			street: "14 Buck Way",
			city: "Horsham",
			region: "US-IL",
			timezone: "America/Chicago",
		},
		checkpoints: [],
	};

	it("displays delivery date when available", () => {
		render(<DeliveryEstimate order={baseOrder} />);

		expect(screen.getByText(/Expected Delivery|Delivery Date/)).toBeInTheDocument();
	});

	it("displays delivery address when hasZip is true", () => {
		render(<DeliveryEstimate order={baseOrder} hasZip={true} />);

		expect(screen.getByText("Delivery Address")).toBeInTheDocument();
		expect(screen.getByText("14 Buck Way")).toBeInTheDocument();
		expect(screen.getByText(/Horsham/)).toBeInTheDocument();
	});

	it("hides delivery address when hasZip is false", () => {
		render(<DeliveryEstimate order={baseOrder} hasZip={false} />);

		expect(screen.queryByText("Delivery Address")).not.toBeInTheDocument();
		expect(screen.queryByText("14 Buck Way")).not.toBeInTheDocument();
	});

	it("defaults to showing address when hasZip is not provided", () => {
		render(<DeliveryEstimate order={baseOrder} />);

		expect(screen.getByText("Delivery Address")).toBeInTheDocument();
		expect(screen.getByText("14 Buck Way")).toBeInTheDocument();
	});

	it("still displays delivery date when hasZip is false", () => {
		render(<DeliveryEstimate order={baseOrder} hasZip={false} />);

		expect(screen.getByText(/Expected Delivery|Delivery Date/)).toBeInTheDocument();
	});

	it("handles missing address gracefully", () => {
		const orderWithoutAddress: Order = {
			...baseOrder,
			delivery_info: {
				...baseOrder.delivery_info,
				street: undefined,
			},
		};

		render(<DeliveryEstimate order={orderWithoutAddress} hasZip={true} />);

		expect(screen.queryByText("Delivery Address")).not.toBeInTheDocument();
		expect(screen.getByText(/Expected Delivery|Delivery Date/)).toBeInTheDocument();
	});

	it("returns null when no delivery date is available", () => {
		const orderWithoutDate: Order = {
			...baseOrder,
			delivery_info: {
				...baseOrder.delivery_info,
				announced_delivery_date: undefined,
			},
			checkpoints: [],
		};

		const { container } = render(<DeliveryEstimate order={orderWithoutDate} />);
		expect(container.firstChild).toBeNull();
	});
});
