import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

export default function Lookup() {
	const [orderNumber, setOrderNumber] = useState("");
	const [zip, setZip] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await fetch(
				`/orders/${encodeURIComponent(orderNumber)}?zip=${encodeURIComponent(zip)}`,
			);
			if (!res.ok) {
				const text = await res.text();
				setError(text || "Order not found or zip mismatch");
				return;
			}
			const orders = (await res.json()) as Order[];
			const order = orders[0];
			if (!order) {
				setError("Order not found");
				return;
			}
			navigate(
				`/order/${encodeURIComponent(order.delivery_info?.orderNo ?? orderNumber)}`,
				{ state: { order: order } },
			);
		} catch (_err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Track your shipment</CardTitle>
					<CardDescription>
						Enter your order number and ZIP code to see delivery status.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="orderNumber">Order number</Label>
							<Input
								id="orderNumber"
								value={orderNumber}
								onChange={(e) => setOrderNumber(e.target.value)}
								autoComplete="off"
								placeholder="e.g. 0000RTAB1"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="zip">ZIP code</Label>
							<Input
								id="zip"
								value={zip}
								onChange={(e) => setZip(e.target.value)}
								autoComplete="off"
								placeholder="e.g. 60156"
								required
							/>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className={cn(loading && "opacity-80")}
						>
							{loading ? "Checking…" : "View order"}
						</Button>
						{error && (
							<Alert role="alert">
								<AlertTitle>Lookup failed</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
