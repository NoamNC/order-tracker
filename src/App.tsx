import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function App() {
	const location = useLocation();
	const isLookupPage =
		location.pathname === "/" || location.pathname === "/lookup";

	return (
		<div>
			<header className="border-b">
				<div className="container-app flex items-center gap-3">
					<img
						src="/parcellab-logo.svg"
						alt="parcelLab"
						className="h-6 w-6 rounded"
					/>
					<Link to="/" className="font-semibold">
						parcelLab — Order Compass
					</Link>
					{!isLookupPage && (
						<nav className="ml-auto flex gap-4 text-sm">
							<NavLink
								to="/lookup"
								className={({ isActive }) => (isActive ? "font-semibold" : "")}
							>
								Lookup Shipment
							</NavLink>
						</nav>
					)}
				</div>
			</header>
			<main className="container-app">
				<Outlet />
			</main>
			<Separator />
			<footer className="container-app text-sm text-muted-foreground">
				No parcels were harmed in the making of this demo.
			</footer>
		</div>
	);
}
