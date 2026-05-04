"use client";

import { useEffect, useRef, useState } from "react";

export interface PlaybackState {
  /** Current simulated timestamp inside the playback range. */
  currentTime: Date;
  /** 0..1 progress through the playback. */
  progress: number;
  /** True once the simulation has reached endTime. */
  finished: boolean;
}

export interface UsePlaybackOptions {
  /** Earliest event time. */
  startTime: Date | null;
  /** Latest event time. */
  endTime: Date | null;
  /** Wall-clock duration of the playback at speed = 1. Default 6s. */
  durationMs?: number;
  /** Playback rate. 1 = base, 4 = 4×, etc. */
  speed?: number;
  /** Pause/play. */
  isPlaying?: boolean;
}

/**
 * Drives a "tape replay" — walks a virtual `currentTime` from startTime to
 * endTime over `durationMs / speed` real-world milliseconds. Callers slice
 * their data by `currentTime` to render the equity curve / trade ledger
 * progressively.
 */
export function usePlayback({
  startTime,
  endTime,
  durationMs = 6000,
  speed = 1,
  isPlaying = true,
}: UsePlaybackOptions): PlaybackState & {
  /** Reset the simulation back to startTime and start playing. */
  restart: () => void;
  /** Skip immediately to endTime. */
  skipToEnd: () => void;
} {
  const [progress, setProgress] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);

  // Reset progress when range changes
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startedAtRef.current = null;
    finishedRef.current = false;
  }, [startTime?.getTime(), endTime?.getTime()]);

  useEffect(() => {
    if (!isPlaying || !startTime || !endTime) return;
    if (finishedRef.current) return;

    let raf: number;
    const realDuration = Math.max(durationMs / Math.max(speed, 0.01), 50);

    const tick = (now: number) => {
      if (startedAtRef.current === null) startedAtRef.current = now;
      const elapsed = now - startedAtRef.current + elapsedRef.current;
      const t = Math.min(elapsed / realDuration, 1);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finishedRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      // Pause: snapshot accumulated elapsed time so resume picks up where we left off.
      if (startedAtRef.current !== null) {
        elapsedRef.current += performance.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
      cancelAnimationFrame(raf);
    };
  }, [isPlaying, startTime?.getTime(), endTime?.getTime(), durationMs, speed]);

  const startMs = startTime?.getTime() ?? 0;
  const endMs = endTime?.getTime() ?? 0;
  const currentTime = new Date(startMs + progress * (endMs - startMs));

  return {
    currentTime,
    progress,
    finished: progress >= 1,
    restart: () => {
      elapsedRef.current = 0;
      startedAtRef.current = null;
      finishedRef.current = false;
      setProgress(0);
    },
    skipToEnd: () => {
      elapsedRef.current = 0;
      startedAtRef.current = null;
      finishedRef.current = true;
      setProgress(1);
    },
  };
}
