import { useMemo } from "react";
import type { Order } from "@/types/order";
import { relativeDayLabel } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DeliveryEstimateProps {
	order: Order;
	hasZip?: boolean;
}

export function DeliveryEstimate({ order, hasZip = true }: DeliveryEstimateProps) {
	const tz = order.delivery_info?.timezone ?? "UTC";
	const deliveryInfo = order.delivery_info;
	const announcedDate = deliveryInfo?.announced_delivery_date;
	
	// Get the latest checkpoint to check for delivery date in meta
	const latestCheckpoint = useMemo(() => {
		const checkpoints = order.checkpoints ?? [];
		if (checkpoints.length === 0) return null;
		const sorted = [...checkpoints].sort(
			(a, b) =>
				new Date(b.event_timestamp).getTime() -
				new Date(a.event_timestamp).getTime(),
		);
		return sorted[0];
	}, [order.checkpoints]);

	const deliveryDate = latestCheckpoint?.meta?.delivery_date ?? announcedDate;
	const timeFrameFrom = latestCheckpoint?.meta?.delivery_time_frame_from;
	const timeFrameTo = latestCheckpoint?.meta?.delivery_time_frame_to;

	if (!deliveryDate) {
		return null;
	}

	const dateLabel = relativeDayLabel(deliveryDate + "T12:00:00Z", tz);
	const formattedDate = new Date(deliveryDate + "T12:00:00Z").toLocaleDateString(
		"en-US",
		{
			timeZone: tz,
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	const isToday = dateLabel === "today";
	const isTomorrow = dateLabel === "tomorrow";
	const isPast = new Date(deliveryDate + "T12:00:00Z") < new Date();

	return (
		<Card className={cn(
			"border-2 w-full",
			isToday && "border-primary/50 bg-primary/5",
			isTomorrow && "border-primary/30 bg-primary/3",
		)}>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center gap-2">
					<svg
						className="w-5 h-5 text-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					{isPast ? "Delivery Date" : "Expected Delivery"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div>
					{isToday || isTomorrow ? (
						<div className="space-y-1">
							<p className="text-2xl font-bold text-primary">
								{isToday ? "Today" : "Tomorrow"}
							</p>
							<p className="text-sm text-muted-foreground">{formattedDate}</p>
						</div>
					) :
					 (
						<div className="space-y-1">
							<p className="text-xl font-semibold">{formattedDate}</p>
						</div>
					)}
				</div>

				{(timeFrameFrom || timeFrameTo) && (
					<div className="pt-2 border-t">
						<p className="text-sm font-medium mb-1">Delivery Window</p>
						<p className="text-sm text-muted-foreground">
							{timeFrameFrom && timeFrameTo
								? `${timeFrameFrom} - ${timeFrameTo}`
								: timeFrameFrom || timeFrameTo || "Time TBD"}
						</p>
					</div>
				)}

				{/* Delivery Address - Only show when ZIP is provided */}
				{hasZip && deliveryInfo?.street && (
					<div className="pt-2 border-t">
						<p className="text-sm font-medium mb-1">Delivery Address</p>
						<div className="text-sm text-muted-foreground space-y-0.5">
							{deliveryInfo.street && <p>{deliveryInfo.street}</p>}
							{(deliveryInfo.city || deliveryInfo.region) && (
								<p>
									{deliveryInfo.city}
									{deliveryInfo.city && deliveryInfo.region ? ", " : ""}
									{deliveryInfo.region}
								</p>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
