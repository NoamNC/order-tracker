export function relativeDayLabel(
	isoString: string,
	timeZone: string,
	now: Date = new Date(),
): string {
	const date = new Date(isoString);

	const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	const diffDays = Math.round(
		(dateDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays === 0) return "today";
	if (diffDays === -1) return "yesterday";
	if (diffDays === 1) return "tomorrow";
	return date.toLocaleString("en-US", {
		timeZone,
		dateStyle: "medium",
		timeStyle: "short",
	});
}
