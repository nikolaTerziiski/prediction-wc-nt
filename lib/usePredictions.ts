"use client";

import { useCallback, useEffect, useState } from "react";
import type { Predictions, Score } from "./types";

const STORAGE_KEY = "wc2026-predictions-v1";

const EMPTY: Predictions = { scores: {}, ko: {} };

function load(): Predictions {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Predictions>;
    return { scores: parsed.scores ?? {}, ko: parsed.ko ?? {} };
  } catch {
    return EMPTY;
  }
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<Predictions>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted predictions only AFTER mount so the server and the client's
  // first paint render identically (avoids an SSR hydration mismatch). The one
  // extra render this triggers is intentional, hence the rule is suppressed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPredictions(load());
    setHydrated(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [predictions, hydrated]);

  const setScore = useCallback((fixtureId: string, score: Score | null) => {
    setPredictions((prev) => {
      const scores = { ...prev.scores };
      if (score == null) delete scores[fixtureId];
      else scores[fixtureId] = score;
      return { ...prev, scores };
    });
  }, []);

  const setKoPick = useCallback(
    (matchId: string, side: "home" | "away" | null) => {
      setPredictions((prev) => {
        const ko = { ...prev.ko };
        if (side == null) delete ko[matchId];
        else ko[matchId] = side;
        return { ...prev, ko };
      });
    },
    [],
  );

  const resetAll = useCallback(() => setPredictions(EMPTY), []);

  const resetScores = useCallback(
    () => setPredictions((prev) => ({ ...prev, scores: {} })),
    [],
  );

  return {
    predictions,
    hydrated,
    setScore,
    setKoPick,
    resetAll,
    resetScores,
  };
}
