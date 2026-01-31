import * as React from "react";

import { Reveal } from "@/components/site/Reveal";
import { Card } from "@/components/ui/card";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(Boolean(mq.matches));
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useCountUp(target: number, active: boolean) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = React.useState(reduced ? target : 0);

  React.useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, target]);

  return value;
}

function Stat({ label, value, suffix, active }: { label: string; value: number; suffix?: string; active: boolean }) {
  const v = useCountUp(value, active);
  return (
    <div className="text-center">
      <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {v}
        {suffix ?? ""}
      </p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  );
}

export function HomeStatsStrip() {
  const [active, setActive] = React.useState(false);

  return (
    <section className="border-b">
      <div className="container py-14">
        <Reveal
          className="relative"
          onVisible={() => {
            setActive(true);
          }}
        >
          <Card className="overflow-hidden">
            <div className="grid gap-8 px-6 py-10 sm:grid-cols-3">
              <Stat label="Weekly review cadence" value={1} suffix="x" active={active} />
              <Stat label="Markets covered" value={6} active={active} />
              <Stat label="Risk-first principle" value={100} suffix="%" active={active} />
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
