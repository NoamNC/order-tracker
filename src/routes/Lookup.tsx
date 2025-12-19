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
			const trimmedZip = zip.trim();
			const hasZip = trimmedZip.length > 0;
			const url = hasZip
				? `/orders/${encodeURIComponent(orderNumber)}?zip=${encodeURIComponent(trimmedZip)}`
				: `/orders/${encodeURIComponent(orderNumber)}`;
			const res = await fetch(url);
			if (!res.ok) {
				const text = await res.text();
				setError(text || "Order not found or zip mismatch");
				return;
			}
			const orders = (await res.json()) as Order[];
			if (orders.length === 0) {
				setError("Order not found");
				return;
			}
			const primaryOrder = orders[0];
			if (!primaryOrder) {
				setError("Order not found");
				return;
			}
			const orderNo = primaryOrder.delivery_info?.orderNo ?? orderNumber;
			// Persist ZIP in sessionStorage for reloads and pass in locationState
			if (hasZip) {
				sessionStorage.setItem(`zip:${orderNo}`, trimmedZip);
			} else {
				sessionStorage.removeItem(`zip:${orderNo}`);
			}
			navigate(`/order/${encodeURIComponent(orderNo)}`, {
				state: {
					orders,
					order: primaryOrder,
					zip: hasZip ? trimmedZip : undefined,
				},
			});
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
						Enter your order number to see delivery status. ZIP code is optional but provides additional details.
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
							<Label htmlFor="zip">ZIP code (optional)</Label>
							<Input
								id="zip"
								value={zip}
								onChange={(e) => setZip(e.target.value)}
								autoComplete="off"
								placeholder="e.g. 60156"
							/>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className={cn(loading && "opacity-80")}
						>
							{loading ? (
								<>
									<div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
									Checking…
								</>
							) : (
								<>
									<svg
										className="w-4 h-4 mr-2"
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
									View order
								</>
							)}
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
