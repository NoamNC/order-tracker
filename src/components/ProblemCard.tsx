import type * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3";

export type ProblemCardProps = {
	/** Main heading text/content. */
	title: React.ReactNode;
	/** Optional icon rendered to the left of the title. */
	icon?: React.ReactNode;
	/** Optional supporting text below the title. */
	description?: React.ReactNode;
	/** Optional badge rendered on the top-right (e.g., "404 Not Found"). */
	badge?: React.ReactNode;

	/** Optional alert title within the card body. */
	alertTitle?: React.ReactNode;
	/** Optional alert description within the card body. */
	alertDescription?: React.ReactNode;

	/** Action buttons/links area (rendered in a responsive row/column). */
	actions?: React.ReactNode;
	/** Extra content rendered below actions (e.g., path, dev details). */
	children?: React.ReactNode;

	titleAs?: HeadingTag;
	className?: string;
};

export function ProblemCard({
	title,
	icon,
	description,
	badge,
	alertTitle,
	alertDescription,
	actions,
	children,
	titleAs = "h1",
	className,
}: ProblemCardProps) {
	const TitleTag = titleAs;
	const hasAlert = alertTitle != null || alertDescription != null;

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<TitleTag className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
							{icon}
							{title}
						</TitleTag>
						{description ? <CardDescription>{description}</CardDescription> : null}
					</div>
					{badge ? <div className="shrink-0">{badge}</div> : null}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{hasAlert ? (
					<Alert>
						{alertTitle ? <AlertTitle>{alertTitle}</AlertTitle> : null}
						{alertDescription ? (
							<AlertDescription>{alertDescription}</AlertDescription>
						) : null}
					</Alert>
				) : null}

				{actions ? (
					<div className="flex flex-col sm:flex-row gap-3">{actions}</div>
				) : null}

				{children}
			</CardContent>
		</Card>
	);
}

