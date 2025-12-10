import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { OrderHeader } from "@/components/OrderHeader";
import { StatusBanner } from "@/components/StatusBanner";
import { Timeline } from "@/components/Timeline";
import { ParcelSummary } from "@/components/ParcelSummary";
import { DeliveryEstimate } from "@/components/DeliveryEstimate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/types/order";

export default function OrderDetails() {
	const { id } = useParams();
	const location = useLocation();
	const locationState = location.state as { order?: Order; orders?: Order[]; hasZip?: boolean } | null;
	const [orders, setOrders] = useState<Order[]>(
		locationState?.orders ?? (locationState?.order ? [locationState.order] : [])
	);
	const [hasZip, setHasZip] = useState<boolean>(locationState?.hasZip ?? false);
	const [error, setError] = useState<string | null>(null);
	
	// Use first order for shared info (delivery_info is the same across all shipments)
	const primaryOrder = orders[0] ?? null;
	const tz = primaryOrder?.delivery_info?.timezone ?? "UTC";

	useEffect(() => {
		async function fetchOrder() {
			if (orders.length > 0 || !id) return;
			// Fetch without ZIP to get basic tracking info
			const res = await fetch(`/orders/${encodeURIComponent(id)}`);
			if (!res.ok) {
				setError("Order not found");
				return;
			}
			const data = (await res.json()) as Order[];
			if (data.length === 0) {
				setError("Order not found");
				return;
			}
			setOrders(data);
			setHasZip(false); // No ZIP was provided in URL
		}
		void fetchOrder();
	}, [id, orders.length]);

	if (error) {
		return (
			<div className="w-full max-w-4xl mx-auto py-8">
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive text-center">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!primaryOrder) {
		return (
			<div className="w-full max-w-4xl mx-auto py-8">
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<p className="text-muted-foreground">Loading order details...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background w-full">
			<div className="w-full max-w-6xl mx-auto py-6 md:py-8">
				{/* Page Header */}
				<div className="mb-6 md:mb-8 text-center sm:text-left">
					<h1 className="text-2xl md:text-3xl font-bold mb-2">
						Order Tracking
					</h1>
					<p className="text-sm md:text-base text-muted-foreground">
						Track your package in real-time
					</p>
				</div>

				{/* Main Content Grid */}
				<div id="check" className="flex flex-col items-stretch gap-6 md:gap-8 w-full">
					{/* Status Banner - Full Width */}
					<div className="w-full">
						<StatusBanner order={primaryOrder} />
					</div>

					{/* Two Column Layout: Delivery Info + Order Info */}
					<div className="w-full">
						<div className="grid gap-6 md:gap-8 lg:grid-cols-2 w-full items-start">
							{/* Left Column: Delivery Estimate */}
							<div className="space-y-6 md:space-y-8 w-full min-w-0">
								<DeliveryEstimate order={primaryOrder} hasZip={hasZip} />
								<OrderHeader orders={orders} hasZip={hasZip} />
							</div>

							{/* Right Column: Parcel Summary */}
							<div className="space-y-6 md:space-y-8 w-full min-w-0">
								<ParcelSummary order={primaryOrder} hasZip={hasZip} />
							</div>
						</div>
					</div>

					{/* Timelines - Full Width, one for each tracking number */}
					<div className="w-full space-y-6 md:space-y-8">
						{orders.map((order, index) => {
							// Use courier + tracking_number as key, fallback to _id, then index
							const key = order._id || `${order.courier}-${order.tracking_number}-${index}`;
							const trackingLabel = order.tracking_number
								? `${order.tracking_number}${order.courier ? ` (${order.courier.toUpperCase()})` : ""}`
								: `Tracking ${index + 1}`;

							return (
								<Card key={key} className="w-full">
									<CardHeader>
										<CardTitle className="text-lg md:text-xl flex items-center gap-2">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
												/>
											</svg>
											Tracking History {orders.length > 1 && `- ${trackingLabel}`}
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										<Timeline checkpoints={order.checkpoints ?? []} tz={tz} />
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
