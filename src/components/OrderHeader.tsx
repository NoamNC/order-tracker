import { useMemo } from "react";
import { relativeDayLabel } from "@/lib/format";
import { computeStatus } from "@/lib/status";
import type { Order } from "@/types/order";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

export function OrderHeader({ order }: { order: Order }) {
	const info = order.delivery_info;
	const tz = order.delivery_info?.timezone ?? "UTC";
	const updatedLabel = relativeDayLabel(order.updated, tz);
	const status = useMemo(
		() =>
			order
				? computeStatus(order.checkpoints ?? [], order.delivery_info)
				: null,
		[order],
	);

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Order Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Order Number */}
				<div className="text-center sm:text-left">
					<p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
						Order Number
					</p>
					<p className="text-lg font-semibold font-mono">
						{info?.orderNo ?? "N/A"}
					</p>
				</div>

				<Separator />

				{/* Tracking Information */}
				<div className="space-y-3">
					<div>
						<p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
							Tracking Number
						</p>
						<div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
							<p className="text-base font-mono font-medium">
								{order.tracking_number ?? "N/A"}
							</p>
							{order.courier && (
								<Badge variant="outline" className="text-xs">
									{order.courier.toUpperCase()}
								</Badge>
							)}
						</div>
					</div>

					{status && (
						<div className="text-center sm:text-left">
							<p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
								Status
							</p>
							<Badge variant="default" className="text-sm">
								{status.label}
							</Badge>
						</div>
					)}
				</div>

				<Separator />

				{/* Recipient Information */}
				{info?.recipient && (
					<>
						<div className="text-center sm:text-left">
							<p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
								Recipient
							</p>
							<p className="text-base font-medium">{info.recipient}</p>
							{info.email && (
								<p className="text-sm text-muted-foreground mt-1">{info.email}</p>
							)}
						</div>
						<Separator />
					</>
				)}

				{/* Additional Info */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
					{order.destination_country_iso3 && (
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
								Destination
							</p>
							<p className="font-medium">{order.destination_country_iso3}</p>
						</div>
					)}
					<div>
						<p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
							Last Updated
						</p>
						<p className="font-medium">{updatedLabel}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
