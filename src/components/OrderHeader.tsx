import { useMemo } from "react";
import { relativeDayLabel } from "@/lib/format";
import { computeStatus } from "@/lib/status";
import type { Order } from "@/types/order";
import { Badge } from "./ui/badge";

export function OrderHeader({ order }: { order: Order }) {
	const info = order.delivery_info;
	const tz = order.delivery_info?.timezone ?? "UTC";
	const updatedLabel = relativeDayLabel(order.updated, tz);
	const status = useMemo(
		() => (order ? computeStatus(order.checkpoints ?? []) : null),
		[order],
	);

	return (
		<div className="grid gap-2 text-sm">
			<div className="flex flex-wrap gap-2 items-center">
				<span className="font-medium">{info?.recipient}</span>
				<Badge variant="outline">{order.courier?.toUpperCase()}</Badge>
				<span className="text-muted-foreground">Tracking Nr:</span>
				<span className="font-mono">{order.tracking_number}</span>
			</div>
			<div className="text-muted-foreground">
				Last update: <span className="font-medium">{updatedLabel}</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Computed status:</span>
				{status && <Badge>{status.label}</Badge>}
			</div>
			<div className="text-muted-foreground">
				Destination:{" "}
				<span className="font-medium">{order.destination_country_iso3}</span>
			</div>
		</div>
	);
}
