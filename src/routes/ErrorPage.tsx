import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProblemCard } from "@/components/ProblemCard";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { isRouteErrorResponse, Link, useLocation, useRouteError } from "react-router-dom";

type ErrorPageProps = {
	reload?: () => void;
};

function reloadPage() {
	window.location.reload();
}

function debugString(err: unknown): string {
	if (isRouteErrorResponse(err)) {
		const data =
			typeof err.data === "string"
				? err.data
				: err.data
					? (() => {
							try {
								return JSON.stringify(err.data, null, 2);
							} catch {
								return String(err.data);
							}
						})()
					: "";

		return [
			`RouteErrorResponse`,
			`status: ${err.status}`,
			`statusText: ${err.statusText}`,
			data ? `data: ${data}` : null,
		]
			.filter(Boolean)
			.join("\n");
	}

	if (err instanceof Error) {
		return [
			`${err.name}: ${err.message}`,
			err.stack ? `\n${err.stack}` : null,
		]
			.filter(Boolean)
			.join("\n");
	}

	if (typeof err === "string") return err;

	try {
		return JSON.stringify(err, null, 2);
	} catch {
		return String(err);
	}
}

export default function ErrorPage({ reload }: ErrorPageProps) {
	const error = useRouteError();
	const location = useLocation();
	const isResponse = isRouteErrorResponse(error);
	const status = isResponse ? error.status : undefined;
	const statusText = isResponse ? error.statusText : undefined;
	const isNotFound = status === 404;

	const title = isNotFound ? "Page not found" : "Something went wrong";
	const message = isNotFound
		? "The page you’re trying to open doesn’t exist or may have been moved."
		: isResponse
			? "We couldn’t complete that request. Please try again."
			: "An unexpected error occurred while loading this page.";

	function onReload() {
		(reload ?? reloadPage)();
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
			<div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
				<div className="w-full max-w-2xl">
					<div className="mb-6 flex items-center justify-center gap-3 text-muted-foreground">
						<img
							src="/parcellab-logo.svg"
							alt="parcelLab"
							className="h-7 w-7 rounded"
							width={28}
							height={28}
							loading="eager"
							decoding="sync"
						/>
						<span className="font-semibold text-sm sm:text-base">
							parcelLab — Order Compass
						</span>
					</div>

					<ProblemCard
						title={title}
						icon={<AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />}
						description={message}
						badge={
							status ? (
								<Badge
									variant={isNotFound ? "outline" : "destructive"}
									className="shrink-0"
								>
									{status}
									{statusText ? ` ${statusText}` : ""}
								</Badge>
							) : null
						}
						alertTitle="What you can do"
						alertDescription={
							<>Reload this page, or return to shipment lookup and try again.</>
						}
						actions={
							<>
								<Button asChild>
									<Link to="/lookup">
										<Home className="h-4 w-4 mr-2" aria-hidden="true" />
										Back to lookup
									</Link>
								</Button>
								<Button variant="outline" type="button" onClick={onReload}>
									<RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
									Reload page
								</Button>
							</>
						}
					>
						<div className="text-xs text-muted-foreground">
							<p>
								Path:{" "}
								<code className="rounded bg-muted px-1.5 py-0.5">{location.pathname}</code>
							</p>
						</div>

						{import.meta.env.DEV ? (
							<details className="rounded-lg border bg-card p-4">
								<summary className="cursor-pointer text-sm font-medium">
									Technical details (dev)
								</summary>
								<pre className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
									{debugString(error)}
								</pre>
							</details>
						) : null}
					</ProblemCard>

					<p className="mt-6 text-center text-xs text-muted-foreground">
						If this keeps happening, please check your connection and try again
						in a moment.
					</p>
				</div>
			</div>
		</div>
	);
}
