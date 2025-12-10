import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { OrderHeader } from "@/components/OrderHeader";
import { StatusBanner } from "@/components/StatusBanner";
import { Timeline } from "@/components/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types/order";

export default function OrderDetails() {
	const { id } = useParams();
	const location = useLocation();
	const [order, setOrder] = useState<Order | null>(
		(location.state as any)?.order ?? null,
	);
	const [error, setError] = useState<string | null>(null);
	const tz = order?.delivery_info?.timezone ?? "UTC";

	useEffect(() => {
		async function fetchOrder() {
			if (order || !id) return;
			const res = await fetch(
				`/orders/${encodeURIComponent(id)}?zip=__unknown__`,
			);
			if (!res.ok) {
				setError("Order not preloaded. Please go through Lookup.");
				return;
			}
			const data = (await res.json()) as Order[];
			if (data.length === 0) {
				setError("Order not found");
				return;
			}
			setOrder(data[0] ?? null);
		}
		void fetchOrder();
	}, [id, order]);

	if (error) return <p className="text-destructive">{error}</p>;
	if (!order) return <p>Loading…</p>;

	return (
		<div className="grid gap-6">
			<StatusBanner order={order} />		
			<Card>
				<CardHeader>
					<CardTitle>Order {order.delivery_info?.orderNo ?? id}</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<OrderHeader order={order} />
					<Separator />

					<Timeline checkpoints={order.checkpoints ?? []} tz={tz} />
				</CardContent>
			</Card>
		</div>
	);
}
