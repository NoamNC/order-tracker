import { cn } from "@/lib/utils";

export function Separator({ className }: { className?: string }) {
	return (
		<div className={cn("shrink-0 bg-border h-px w-full my-6", className)} />
	);
}
