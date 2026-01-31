import * as React from "react";
import type { CarouselApi } from "@/components/ui/carousel";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

type Options = {
  intervalMs: number;
  paused: boolean;
};

/**
 * Stable carousel autoplay that schedules the next advance after each selection.
 * This avoids multiple intervals and helps prevent “instant” slide skipping.
 */
export function useCarouselAutoplay(api: CarouselApi | undefined, { intervalMs, paused }: Options) {
  const timeoutRef = React.useRef<number | null>(null);

  const clear = React.useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const schedule = React.useCallback(() => {
    clear();
    if (!api) return;
    if (paused) return;
    if (prefersReducedMotion()) return;

    timeoutRef.current = window.setTimeout(() => {
      api.scrollNext();
    }, intervalMs);
  }, [api, paused, intervalMs, clear]);

  React.useEffect(() => {
    if (!api) return;

    // Schedule on mount + every time the selected slide changes.
    schedule();
    api.on("select", schedule);
    api.on("reInit", schedule);

    return () => {
      clear();
      api.off("select", schedule);
      api.off("reInit", schedule);
    };
  }, [api, schedule, clear]);
}
