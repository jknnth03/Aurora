import { useState, useEffect, useRef, useCallback } from "react";

const useCountdownTimer = (durationInMs: number, onComplete?: () => void) => {
  const [state, setState] = useState({
    progress: 100,
    isPaused: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number | null>(null);
  const durationRef = useRef(durationInMs);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    durationRef.current = durationInMs;
  }, [durationInMs]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimerInterval();

    if (durationRef.current <= 0) {
      setState((s) => ({ ...s, progress: 0 }));
      onCompleteRef.current?.();
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingPercent = Math.max(
        0,
        100 - (elapsed / durationRef.current) * 100,
      );

      setState((s) => ({ ...s, progress: remainingPercent }));

      if (remainingPercent <= 0) {
        clearTimerInterval();
        onCompleteRef.current?.();
      }
    }, 50);
  }, [clearTimerInterval]);

  const resetTimer = useCallback(() => {
    clearTimerInterval();
    startTimeRef.current = Date.now();
    pausedTimeRef.current = null;
    setState({ progress: 100, isPaused: false });
    startTimer();
  }, [clearTimerInterval, startTimer]);

  const pauseTimer = useCallback(() => {
    if (state.isPaused) return;

    setState((s) => ({ ...s, isPaused: true }));
  }, [state.isPaused]);

  const resumeTimer = useCallback(() => {
    if (!state.isPaused) return;

    setState((s) => ({ ...s, isPaused: false }));
  }, [state.isPaused]);

  useEffect(() => {
    const { isPaused } = state;

    if (isPaused) {
      clearTimerInterval();
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    } else if (pausedTimeRef.current !== null) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = null;
      startTimer();
    }
  }, [state.isPaused, clearTimerInterval, startTimer]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    resetTimer();

    return clearTimerInterval;
  }, [resetTimer, clearTimerInterval]);

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
