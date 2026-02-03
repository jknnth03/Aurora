import moment, { Moment } from "moment";

const countWeekdays = (startDate: Moment, endDate: Moment): number => {
	let count = 0;
	const current = startDate.clone();

	while (current.isSameOrBefore(endDate, "day")) {
		// Monday = 1, Friday = 5, Saturday = 6, Sunday = 0
		const dayOfWeek = current.day();
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			count++;
		}
		current.add(1, "day");
	}

	return count;
};

export const isWithinBuffer = (date: string | Date | Moment, buffer: number): boolean => {
	const startDate = moment(date);
	const endDate = moment();

	const weekdaysDiff = countWeekdays(startDate, endDate);

	return weekdaysDiff <= buffer;
};
