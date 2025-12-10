import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function App() {
	const location = useLocation();
	const isLookupPage =
		location.pathname === "/" || location.pathname === "/lookup";

	return (
		<div>
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container-app flex items-center gap-3 py-4">
					<Link
						to="/"
						className="flex items-center gap-3 hover:opacity-80 transition-opacity"
					>
						<img
							src="/parcellab-logo.svg"
							alt="parcelLab"
							className="h-7 w-7 rounded"
							width={28}
							height={28}
							loading="eager"
							fetchPriority="high"
							decoding="sync"
						/>
						<span className="font-semibold text-lg">parcelLab — Order Compass</span>
					</Link>
					{!isLookupPage && (
						<nav className="ml-auto flex gap-4 text-sm">
							<NavLink
								to="/lookup"
								className={({ isActive }) =>
									cn(
										"flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
										isActive
											? "font-semibold text-primary bg-primary/10"
											: "hover:text-primary hover:bg-accent",
									)
								}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
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
