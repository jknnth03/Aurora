import { useEffect, useState, useRef, useCallback } from "react";
import moment from "moment";

/**
 * Granularity options for the useLiveDateTime hook
 */
export type TimeGranularity = "seconds" | "minutes" | "hours" | "day";

/**
 * Hook that provides a live date/time with configurable update frequency
 * to minimize unnecessary re-renders
 */
export const useLiveDateTime = (options = { granularity: "seconds" as TimeGranularity }) => {
	// Store the moment object in a ref to always have access to current time
	// without causing re-renders
	const currentMomentRef = useRef(moment());

	// Only store in state the specific time parts we need based on granularity
	const [timeState, setTimeState] = useState(() => {
		const now = moment();
		return {
			hours: now.hours(),
			minutes: now.minutes(),
			seconds: now.seconds(),
			day: now.date(),
			month: now.month(),
			year: now.year(),
		};
	});

	// Determine interval based on granularity
	const getIntervalMs = useCallback(() => {
		switch (options.granularity) {
			case "hours":
				return 60 * 60 * 1000; // 1 hour
			case "minutes":
				return 60 * 1000; // 1 minute
			case "day":
				return 24 * 60 * 60 * 1000; // 1 day
			case "seconds":
			default:
				return 1000; // 1 second
		}
	}, [options.granularity]);

	useEffect(() => {
		// Function to update both the ref and potentially the state
		const updateDateTime = () => {
			const now = moment();
			// Always update the ref (doesn't cause re-renders)
			currentMomentRef.current = now;

			// Get current values for comparison
			const currentHours = now.hours();
			const currentMinutes = now.minutes();
			const currentSeconds = now.seconds();
			const currentDay = now.date();

			// Always update on first run or when relevant time unit changes
			const shouldUpdate =
				(options.granularity === "seconds" && currentSeconds !== timeState.seconds) ||
				(options.granularity === "minutes" &&
					(currentMinutes !== timeState.minutes || currentHours !== timeState.hours)) ||
				(options.granularity === "hours" && currentHours !== timeState.hours) ||
				(options.granularity === "day" && currentDay !== timeState.day);

			if (shouldUpdate) {
				setTimeState({
					hours: currentHours,
					minutes: currentMinutes,
					seconds: currentSeconds,
					day: currentDay,
					month: now.month(),
					year: now.year(),
				});
			}
		};

		// Run immediately to sync
		updateDateTime();

		// Set up interval with proper frequency
		const intervalId = setInterval(updateDateTime, getIntervalMs());

		return () => clearInterval(intervalId);
	}, [options.granularity, getIntervalMs]);

	// Method to get current moment without causing re-renders
	const getCurrentMoment = useCallback(() => {
		return moment(currentMomentRef.current);
	}, []);

	// Method to get current date without causing re-renders (for backwards compatibility)
	const getCurrentDate = useCallback(() => {
		return currentMomentRef.current.toDate();
	}, []);

	// Return both the state values and methods
	return {
		// State values that will cause re-renders when they change
		hours: timeState.hours,
		minutes: timeState.minutes,
		seconds: timeState.seconds,
		day: timeState.day,
		month: timeState.month,
		year: timeState.year,

		// Methods that don't cause re-renders
		getCurrentMoment,
		getCurrentDate, // Keep for backwards compatibility

		// Formatted strings using moment's formatting
		formatted: {
			time:
				options.granularity === "seconds"
					? moment(timeState).format("HH:mm:ss")
					: moment(timeState).format("HH:mm"),
			date: moment(timeState).format("M/D/YYYY"),
			// Additional moment formatting options
			iso: moment(timeState).toISOString(),
			relative: moment(timeState).fromNow(),
			calendar: moment(timeState).calendar(),
		},
	};
};

export default useLiveDateTime;
