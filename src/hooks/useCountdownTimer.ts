import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for managing a countdown timer with pause, resume, and reset functionality
 *
 * @param durationInMs - Total duration of the timer in milliseconds
 * @param onComplete - Optional callback function to execute when timer completes
 * @returns Timer control object with progress, isPaused status, and control functions
 */
const useCountdownTimer = (durationInMs: number, onComplete?: () => void) => {
	const [state, setState] = useState({
		progress: 100,
		isPaused: false,
	});

	// Use refs for values that don't need to trigger re-renders
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const startTimeRef = useRef<number>(0);
	const pausedTimeRef = useRef<number | null>(null);
	const durationRef = useRef(durationInMs);
	const onCompleteRef = useRef(onComplete);

	// Update refs when dependencies change without triggering effects
	useEffect(() => {
		durationRef.current = durationInMs;
	}, [durationInMs]);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	// Clear interval safely
	const clearTimerInterval = useCallback(() => {
		if (timerRef.current !== null) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Start the timer interval - memoized for performance
	const startTimer = useCallback(() => {
		clearTimerInterval();

		if (durationRef.current <= 0) {
			// Handle invalid duration
			//console.warn("Timer duration must be greater than 0ms");
			setState((s) => ({ ...s, progress: 0 }));
			onCompleteRef.current?.();
			return;
		}

		timerRef.current = setInterval(() => {
			const elapsed = Date.now() - startTimeRef.current;
			const remainingPercent = Math.max(0, 100 - (elapsed / durationRef.current) * 100);

			setState((s) => ({ ...s, progress: remainingPercent }));

			if (remainingPercent <= 0) {
				clearTimerInterval();
				onCompleteRef.current?.();
			}
		}, 50); // 50ms provides smooth animation while reducing CPU usage
	}, [clearTimerInterval]);

	// Initialize or reset timer
	const resetTimer = useCallback(() => {
		clearTimerInterval();
		startTimeRef.current = Date.now();
		pausedTimeRef.current = null;
		setState({ progress: 100, isPaused: false });
		startTimer();
	}, [clearTimerInterval, startTimer]);

	// Pause the timer
	const pauseTimer = useCallback(() => {
		if (state.isPaused) return; // Guard against redundant state updates

		setState((s) => ({ ...s, isPaused: true }));
	}, [state.isPaused]);

	// Resume the timer
	const resumeTimer = useCallback(() => {
		if (!state.isPaused) return; // Guard against redundant state updates

		setState((s) => ({ ...s, isPaused: false }));
	}, [state.isPaused]);

	// Handle pause/resume effect with cleanup
	useEffect(() => {
		const { isPaused } = state;

		if (isPaused) {
			clearTimerInterval();
			// Store how much time has elapsed when paused
			pausedTimeRef.current = Date.now() - startTimeRef.current;
		} else if (pausedTimeRef.current !== null) {
			// Adjust the start time to account for the paused duration
			startTimeRef.current = Date.now() - pausedTimeRef.current;
			pausedTimeRef.current = null;
			startTimer();
		}
	}, [state.isPaused, clearTimerInterval, startTimer]);

	// Initialize timer on mount and cleanup on unmount
	useEffect(() => {
		startTimeRef.current = Date.now();
		resetTimer();

		return clearTimerInterval;
	}, [resetTimer, clearTimerInterval]);

	// Destructure for cleaner return
	const { progress, isPaused } = state;

	return {
		progress,
		isPaused,
		pause: pauseTimer,
		resume: resumeTimer,
		reset: resetTimer,
	};
};

export default useCountdownTimer;
