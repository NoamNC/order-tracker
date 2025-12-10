export function relativeDayLabel(
	isoString: string,
	timeZone: string,
	now: Date = new Date(),
): string {
	const date = new Date(isoString);

	// Get date components in the specified timezone
	const dateFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const nowFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});

	const dateParts = dateFormatter.formatToParts(date);
	const nowParts = nowFormatter.formatToParts(now);

	const dateYear = parseInt(dateParts.find((p) => p.type === "year")!.value);
	const dateMonth = parseInt(dateParts.find((p) => p.type === "month")!.value);
	const dateDay = parseInt(dateParts.find((p) => p.type === "day")!.value);

	const nowYear = parseInt(nowParts.find((p) => p.type === "year")!.value);
	const nowMonth = parseInt(nowParts.find((p) => p.type === "month")!.value);
	const nowDay = parseInt(nowParts.find((p) => p.type === "day")!.value);

	const dateDayObj = new Date(dateYear, dateMonth - 1, dateDay);
	const nowDayObj = new Date(nowYear, nowMonth - 1, nowDay);

	const diffDays = Math.round(
		(dateDayObj.getTime() - nowDayObj.getTime()) / (1000 * 60 * 60 * 24),
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
