import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParcelSummary } from "@/components/ParcelSummary";
import type { Order } from "@/types/order";

describe("ParcelSummary", () => {
	it("shows an empty state when there are no articles", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [],
			},
		};

		render(<ParcelSummary order={order} />);
		expect(screen.getByText("Package Contents")).toBeInTheDocument();
		expect(screen.getByText("No package contents available.")).toBeInTheDocument();
	});

	it("shows an empty state when delivery_info is missing", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
		};

		render(<ParcelSummary order={order} />);
		expect(screen.getByText("Package Contents")).toBeInTheDocument();
		expect(screen.getByText("No package contents available.")).toBeInTheDocument();
	});

	it("renders article list with all fields", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("Package Contents")).toBeInTheDocument();
		expect(screen.getByText("iPhone Pro 128GB")).toBeInTheDocument();
		expect(screen.getByText("SKU: AB20224")).toBeInTheDocument();
		expect(screen.getByText("Qty: 1")).toBeInTheDocument();
		expect(screen.getByText("$1,299.00")).toBeInTheDocument();
		expect(screen.getByText("1 item")).toBeInTheDocument();
		expect(screen.getByText(/Total: \$1,299\.00/)).toBeInTheDocument();
	});

	it("renders multiple articles correctly", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20100",
						articleName: "iPhone Pro Case",
						articleImageUrl: "https://example.com/case.jpg",
						quantity: 1,
						price: 59.0,
					},
					{
						articleNo: "AB20129",
						articleName: "Magsafe Charger",
						articleImageUrl: "https://example.com/charger.jpg",
						quantity: 2,
						price: 49.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("iPhone Pro Case")).toBeInTheDocument();
		expect(screen.getByText("Magsafe Charger")).toBeInTheDocument();
		expect(screen.getByText("SKU: AB20100")).toBeInTheDocument();
		expect(screen.getByText("SKU: AB20129")).toBeInTheDocument();
		expect(screen.getByText("Qty: 1")).toBeInTheDocument();
		expect(screen.getByText("Qty: 2")).toBeInTheDocument();
		expect(screen.getByText("3 items")).toBeInTheDocument();
		expect(screen.getByText(/Total: \$157\.00/)).toBeInTheDocument();
	});

	it("renders product links when productUrl is provided", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
						productUrl: "https://shop.example.com/products/iphone-pro",
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		const nameLink = screen.getByText("iPhone Pro 128GB").closest("a");
		expect(nameLink).toBeInTheDocument();
		expect(nameLink).toHaveAttribute(
			"href",
			"https://shop.example.com/products/iphone-pro",
		);
		expect(nameLink).toHaveAttribute("target", "_blank");
		expect(nameLink).toHaveAttribute("rel", "noopener noreferrer");

		const imageLink = screen
			.getByLabelText("View iPhone Pro 128GB product page")
			.closest("a");
		expect(imageLink).toBeInTheDocument();
		expect(imageLink).toHaveAttribute(
			"href",
			"https://shop.example.com/products/iphone-pro",
		);
	});

	it("does not render product links when productUrl is missing", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		const nameElement = screen.getByText("iPhone Pro 128GB");
		expect(nameElement.closest("a")).toBeNull();
	});

	it("handles missing article name with fallback", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("Unnamed Product")).toBeInTheDocument();
	});

	it("handles missing article number with fallback", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("SKU: N/A")).toBeInTheDocument();
	});

	it("handles missing quantity with fallback", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 0,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("Qty: 0")).toBeInTheDocument();
		expect(screen.getByText("0 items")).toBeInTheDocument();
	});

	it("handles missing image URL with placeholder", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: null,
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		const { container } = render(<ParcelSummary order={order} />);

		// The placeholder should be rendered (checking for the SVG icon)
		const placeholder = container.querySelector("svg");
		expect(placeholder).toBeInTheDocument();
		expect(placeholder).toHaveAttribute("aria-hidden", "true");
	});

	it("calculates total items correctly with multiple quantities", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20100",
						articleName: "Item 1",
						quantity: 3,
						price: 10.0,
					},
					{
						articleNo: "AB20101",
						articleName: "Item 2",
						quantity: 2,
						price: 20.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("5 items")).toBeInTheDocument();
		expect(screen.getByText(/Total: \$70\.00/)).toBeInTheDocument();
	});

	it("handles articles with zero price", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "Free Item",
						quantity: 1,
						price: 0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		expect(screen.getByText("Free Item")).toBeInTheDocument();
		expect(screen.getByText("Qty: 1")).toBeInTheDocument();
		// Price should not be displayed when it's 0
		expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
		expect(screen.getByText("1 item")).toBeInTheDocument();
		// Total should not be displayed when it's 0
		expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
	});

	it("handles productUrl with null value", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
						productUrl: null,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);

		const nameElement = screen.getByText("iPhone Pro 128GB");
		expect(nameElement.closest("a")).toBeNull();
	});

	it("renders correct pluralization for items", () => {
		const orderSingle: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "Item",
						quantity: 1,
						price: 10.0,
					},
				],
			},
		};

		const { rerender } = render(<ParcelSummary order={orderSingle} />);
		expect(screen.getByText("1 item")).toBeInTheDocument();

		const orderMultiple: Order = {
			_id: "2",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "Item",
						quantity: 2,
						price: 10.0,
					},
				],
			},
		};

		rerender(<ParcelSummary order={orderMultiple} />);
		expect(screen.getByText("2 items")).toBeInTheDocument();
	});

	it("shows a ZIP-required state when hasZip is false", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} hasZip={false} />);
		expect(screen.getByText("Package Contents")).toBeInTheDocument();
		expect(
			screen.getByText("Enter your ZIP code to view package contents."),
		).toBeInTheDocument();
		expect(screen.queryByText("iPhone Pro 128GB")).not.toBeInTheDocument();
	});

	it("shows package contents when hasZip is true", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} hasZip={true} />);
		expect(screen.getByText("Package Contents")).toBeInTheDocument();
		expect(screen.getByText("iPhone Pro 128GB")).toBeInTheDocument();
	});

	it("defaults to showing contents when hasZip is not provided", () => {
		const order: Order = {
			_id: "1",
			created: "2023-01-01T00:00:00Z",
			updated: "2023-01-01T00:00:00Z",
			delivery_info: {
				articles: [
					{
						articleNo: "AB20224",
						articleName: "iPhone Pro 128GB",
						articleImageUrl: "https://example.com/image.jpg",
						quantity: 1,
						price: 1299.0,
					},
				],
			},
		};

		render(<ParcelSummary order={order} />);
		expect(screen.getByText("Package Contents")).toBeInTheDocument();
	});
});

