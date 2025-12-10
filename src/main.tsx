import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@/styles/globals.css";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import Lookup from "./routes/Lookup";
import OrderDetails from "./routes/OrderDetails";

async function enableMocking() {
	if (import.meta.env.DEV) {
		const { worker } = await import("./mocks/browser");
		await worker.start({ onUnhandledRequest: "bypass" });
	}
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{ index: true, element: <Lookup /> },
			{ path: "lookup", element: <Lookup /> },
			{ path: "order/:id", element: <OrderDetails /> },
		],
	},
]);

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");
enableMocking().then(() => {
	ReactDOM.createRoot(container).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
});
