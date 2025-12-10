import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();
	const message = isRouteErrorResponse(error)
		? `${error.status} ${error.statusText}`
		: "Something went wrong";
	return (
		<div className="mx-auto max-w-lg">
			<h1 className="text-2xl font-semibold mb-2">Oops.</h1>
			<p className="text-muted-foreground mb-4">{message}</p>
			<Link className="underline" to="/">
				Go home
			</Link>
		</div>
	);
}
