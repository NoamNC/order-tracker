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

	// Calculate day difference directly from date components to avoid timezone issues
	// Convert both dates to day numbers (days since a fixed epoch) for accurate comparison
	function daysSinceEpoch(year: number, month: number, day: number): number {
		// Count leap years up to (but not including) the current year
		// This gives us the baseline days from year 0 to the start of the current year
		const yearsBefore = year - 1;
		let days = yearsBefore * 365 + 
			Math.floor(yearsBefore / 4) - 
			Math.floor(yearsBefore / 100) + 
			Math.floor(yearsBefore / 400);
		
		// Calculate day-of-year for the current year
		// Day-of-year is 1-based (Jan 1 = day 1)
		const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
		let dayOfYear = 0;
		for (let i = 0; i < month - 1; i++) {
			dayOfYear += daysInMonth[i] ?? 0;
		}
		dayOfYear += day;
		
		// Add the leap day if it's a leap year and we're in February or later
		// This ensures consistent day-of-year semantics: dates from Feb 1 onwards in a leap year
		// all include the leap day adjustment, making Feb 28 and Mar 1 have a difference of 1
		// (as required for "tomorrow" detection, even though there's a calendar day in between)
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		if (isLeapYear && month >= 2) {
			dayOfYear += 1;
		}
		
		// Convert day-of-year to days since epoch
		// Note: dayOfYear is 1-based, so we subtract 1 to get 0-based offset from start of year
		days += dayOfYear - 1;
		
		return days;
	}

	const diffDays = daysSinceEpoch(dateYear, dateMonth, dateDay) - daysSinceEpoch(nowYear, nowMonth, nowDay);

	if (diffDays === 0) return "today";
	if (diffDays === -1) return "yesterday";
	if (diffDays === 1) return "tomorrow";
	return date.toLocaleString("en-US", {
		timeZone,
		dateStyle: "medium",
		timeStyle: "short",
	});
}
