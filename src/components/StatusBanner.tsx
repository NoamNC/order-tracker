import { useMemo } from "react";
import { explainStatus } from "@/lib/explainer";
import { computeStatus } from "@/lib/status";
import type { Order } from "@/types/order";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface StatusBannerProps {
	order: Order;
}

function getStatusVariant(
	statusCode: string,
): "default" | "destructive" | "outline" {
	switch (statusCode) {
		case "delivered":
			return "default";
		case "failed_attempt":
			return "destructive";
		case "delayed":
			return "outline";
		case "out_for_delivery":
			return "default";
		default:
			return "outline";
	}
}

function getStatusColorClass(statusCode: string): string {
	switch (statusCode) {
		case "delivered":
			return "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700";
		case "failed_attempt":
			return "bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700";
		case "delayed":
			return "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700";
		case "ready_for_collection":
			return "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700";
		case "scheduled":
			return "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700";
		case "out_for_delivery":
			return "bg-purple-50 border-purple-300 dark:bg-purple-950 dark:border-purple-700";
		default:
			return "bg-muted border-border";
	}
}

export function StatusBanner({ order }: StatusBannerProps) {
	const status = useMemo(
		() => computeStatus(order.checkpoints ?? [], order.delivery_info),
		[order],
	);

	const explanation = useMemo(
		() => explainStatus(order, status),
		[order, status],
	);

	const statusVariant = getStatusVariant(status.code);
	const colorClass = getStatusColorClass(status.code);

	return (
		<div
			className={cn(
				"rounded-xl border-2 shadow-sm p-8 space-y-4",
				colorClass,
			)}
		>
			<div className="space-y-4">
				{/* Status Header */}
				<div className="flex items-center gap-4 flex-wrap">
					<Badge 
						variant={statusVariant} 
						className="text-lg px-4 py-2 font-semibold"
					>
						{status.label}
					</Badge>
				</div>
				
				<div className="space-y-2">
					<p className="text-xl font-bold text-foreground leading-tight">
						{explanation.nextAction}
					</p>
					{/* Human-readable explanation */}
					<p className="text-base text-muted-foreground leading-relaxed">
						{explanation.explanation}
					</p>
				</div>
			</div>
		</div>
	);
}
