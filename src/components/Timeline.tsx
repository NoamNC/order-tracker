import { relativeDayLabel } from "@/lib/format";
import type { Checkpoint } from "@/types/order";
import { Separator } from "./ui/separator";

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

	return (
		<div className="grid gap-4">
			{sorted.map((cp, idx) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: synthetic data without stable ids
				<div key={idx} className="grid gap-1">
					<div className="flex items-center gap-2">
						<span className="font-medium">{cp.status}</span>
						<span className="text-xs text-muted-foreground">
							{relativeDayLabel(cp.event_timestamp, tz)}
						</span>
					</div>
					<div className="text-sm text-muted-foreground">
						{cp.status_details}
					</div>
					{(cp.city || cp.country_iso3) && (
						<div className="text-xs text-muted-foreground">
							{cp.city}
							{cp.city && cp.country_iso3 ? ", " : ""}
							{cp.country_iso3}
						</div>
					)}
					{idx < sorted.length - 1 && <Separator className="my-3" />}
				</div>
			))}
			{sorted.length === 0 && (
				<p className="text-sm text-muted-foreground">No checkpoints yet.</p>
			)}
		</div>
	);
}
