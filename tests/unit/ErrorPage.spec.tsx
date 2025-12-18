import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	Outlet,
	RouterProvider,
	createMemoryRouter,
	type RouteObject,
} from "react-router-dom";
import ErrorPage from "@/routes/ErrorPage";

function renderErrorRoute(opts: { initialEntry: string; routes: RouteObject[] }) {
	const router = createMemoryRouter(opts.routes, {
		initialEntries: [opts.initialEntry],
	});
	return render(<RouterProvider router={router} />);
}

describe("ErrorPage", () => {
	it("renders a 404 not found experience for route error responses", async () => {
		renderErrorRoute({
			initialEntry: "/missing",
			routes: [
				{
					path: "/",
					element: <Outlet />,
					errorElement: <ErrorPage />,
					children: [
						{
							path: "missing",
							loader: () => {
								throw new Response("Not Found", {
									status: 404,
									statusText: "Not Found",
								});
							},
							element: <div />,
						},
					],
				},
			],
		});

		expect(
			await screen.findByRole("heading", { name: /page not found/i }),
		).toBeInTheDocument();

		// Status badge
		expect(screen.getByText(/404\s+not found/i)).toBeInTheDocument();

		// Navigation affordances
		const backLink = screen.getByRole("link", { name: /back to lookup/i });
		expect(backLink).toHaveAttribute("href", "/lookup");
		expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();

		// Path shown for debugging/user support
		expect(screen.getByText("/missing", { selector: "code" })).toBeInTheDocument();
	});

	it("renders a generic error experience for unexpected errors", async () => {
		renderErrorRoute({
			initialEntry: "/boom",
			routes: [
				{
					path: "/",
					element: <Outlet />,
					errorElement: <ErrorPage />,
					children: [
						{
							path: "boom",
							loader: () => {
								throw new Error("Kaboom");
							},
							element: <div />,
						},
					],
				},
			],
		});

		expect(
			await screen.findByRole("heading", { name: /something went wrong/i }),
		).toBeInTheDocument();

		// No HTTP status for thrown errors
		expect(screen.queryByText(/404/i)).not.toBeInTheDocument();

		expect(screen.getByRole("link", { name: /back to lookup/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
		expect(screen.getByText("/boom", { selector: "code" })).toBeInTheDocument();
	});

	it("reloads the page when the reload button is clicked", async () => {
		const reloadSpy = vi.fn();

		renderErrorRoute({
			initialEntry: "/boom",
			routes: [
				{
					path: "/",
					element: <Outlet />,
					errorElement: <ErrorPage reload={reloadSpy} />,
					children: [
						{
							path: "boom",
							loader: () => {
								throw new Error("Kaboom");
							},
							element: <div />,
						},
					],
				},
			],
		});

		const reloadButton = await screen.findByRole("button", { name: /reload page/i });
		reloadButton.click();
		expect(reloadSpy).toHaveBeenCalledTimes(1);
	});
});

