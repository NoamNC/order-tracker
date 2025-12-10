import { relativeDayLabel } from "@/lib/format";
import type { Checkpoint } from "@/types/order";
import { cn } from "@/lib/utils";

export function Timeline({
	checkpoints,
	tz,
}: {
	checkpoints: Checkpoint[];
	tz: string;
}) {
	const sorted = [...(checkpoints ?? [])].sort((a, b) => {
		return (
			new Date(b.event_timestamp).getTime() -
			new Date(a.event_timestamp).getTime()
		);
	});

	if (sorted.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-sm text-muted-foreground">No tracking updates yet.</p>
			</div>
		);
	}

	return (
		<div className="relative">
			{/* Timeline line */}
			<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-[19px]" />
			
			<div className="space-y-0">
				{sorted.map((cp, idx) => {
					const isLatest = idx === 0;
					const date = new Date(cp.event_timestamp);
					const timeStr = date.toLocaleString("en-US", {
						timeZone: tz,
						hour: "2-digit",
						minute: "2-digit",
					});
					const dateLabel = relativeDayLabel(cp.event_timestamp, tz);

					return (
						<div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
							{/* Timeline dot */}
							<div className="relative z-10 flex-shrink-0">
								<div
									className={cn(
										"w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
										isLatest
											? "bg-primary border-primary shadow-lg shadow-primary/20"
											: "bg-background border-muted-foreground/30",
										"md:w-10 md:h-10",
									)}
								>
									{isLatest && (
										<div className="w-2 h-2 rounded-full bg-primary-foreground md:w-2.5 md:h-2.5" />
									)}
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0 pb-1">
								<div className="space-y-1.5">
									{/* Status and date */}
									<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
										<h4
											className={cn(
												"font-semibold leading-tight",
												isLatest
													? "text-base text-foreground md:text-lg"
													: "text-sm text-foreground/90 md:text-base",
											)}
										>
											{cp.status}
										</h4>
										<div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
											<time dateTime={cp.event_timestamp}>
												{dateLabel === "today" || dateLabel === "yesterday" || dateLabel === "tomorrow" ? (
													<span className="font-medium">{dateLabel}</span>
												) : (
													<span>{dateLabel}</span>
												)}
											</time>
											<span className="text-muted-foreground/60">•</span>
											<time dateTime={cp.event_timestamp}>{timeStr}</time>
										</div>
									</div>

									{/* Status details */}
									{cp.status_details && (
										<p className="text-sm text-muted-foreground leading-relaxed">
											{cp.status_details}
										</p>
									)}

									{/* Location */}
									{(cp.city || cp.country_iso3) && (
										<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
											<svg
												className="w-3.5 h-3.5 flex-shrink-0"
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
											<span className="truncate">
												{cp.city}
												{cp.city && cp.country_iso3 ? ", " : ""}
												{cp.country_iso3}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
