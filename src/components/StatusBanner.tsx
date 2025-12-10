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
		case "ready_for_collection":
			return "default";
		case "scheduled":
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

function getStatusIcon(statusCode: string) {
	switch (statusCode) {
		case "delivered":
			return (
				<svg
					className="w-6 h-6 md:w-7 md:h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		case "failed_attempt":
			return (
				<svg
					className="w-6 h-6 md:w-7 md:h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			);
		case "ready_for_collection":
			return (
				<svg
					className="w-6 h-6 md:w-7 md:h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			);
		case "out_for_delivery":
			return (
				<svg
					className="w-6 h-6 md:w-7 md:h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			);
		default:
			return (
				<svg
					className="w-6 h-6 md:w-7 md:h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
			);
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
	const icon = getStatusIcon(status.code);

	return (
		<div
			className={cn(
				"rounded-xl border-2 shadow-sm p-4 md:p-6 lg:p-8",
				colorClass,
			)}
		>
			<div className="flex gap-4 md:gap-6">
				{/* Icon */}
				<div className="flex-shrink-0 mt-0.5">
					<div className="text-foreground/80 mt-1">{icon}</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0 space-y-3 md:space-y-4">
					{/* Status Header */}
					<div className="flex items-center gap-3 flex-wrap">
						<Badge
							variant={statusVariant}
							className="text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2 font-semibold bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 shadow-sm"
						>
							{status.label}
						</Badge>
					</div>

					{/* Main Message */}
					<div className="space-y-2">
						<p className="text-lg md:text-xl font-bold text-foreground leading-tight">
							{explanation.nextAction}
						</p>
						{/* Human-readable explanation */}
						<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
							{explanation.explanation}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
