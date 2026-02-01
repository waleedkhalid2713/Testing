import * as React from "react";
import watermarkLogo from "@/assets/epic-trader-logo.png";

type IntroModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function IntroModal({ isOpen, onClose }: IntroModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src={watermarkLogo}
            alt=""
            aria-hidden="true"
            className="w-[85%] max-w-3xl opacity-10"
          />
        </div>
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">About Epic Trader</p>
            <h2 className="text-2xl font-semibold tracking-tight">Introduction</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-3 py-1 text-sm font-medium transition hover:bg-muted"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <p>
              At Epic Trader, we help traders simplify the market by focusing on{" "}
              <strong>algorithmic price action</strong>—the kind of structure and behavior that ICT (Inner Circle
              Trader) concepts are built around. Our core belief is simple: when you learn to read price the right way,
              you stop chasing indicators and start understanding <strong>why</strong> the market moves.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Our Story</h3>
            <p>
              Epic Trader began as a personal trading journey in <strong>2019</strong>—a period filled with trial,
              error, and the reality most traders face: information overload, inconsistency, and emotional
              decision-making. From <strong>2019 to 2023</strong>, we struggled to find a framework that truly explained
              price movement with clarity and repeatability.
            </p>
            <p>
              Everything changed when we discovered <strong>Michael J. Huddleston</strong>, widely known for shaping
              modern market-structure thinking and institutional-style methodology. That exposure helped us connect the
              dots and evolve through key stages of learning—<strong>Price Action → VSA → SMC → and ultimately ICT
              concepts</strong>—into a more structured, rules-based approach.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">What We Teach</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">ICT Concepts &amp; Algorithmic Price Action</p>
                <p className="text-muted-foreground">
                  Understanding liquidity, market structure, displacement, imbalances, and timing—so you can read price
                  with purpose.
                </p>
              </div>
              <div>
                <p className="font-semibold">Smart Money Knowledge (SMC)</p>
                <p className="text-muted-foreground">
                  Learning how institutions leave footprints and how retail traders can align with high-probability
                  behavior.
                </p>
              </div>
              <div>
                <p className="font-semibold">Risk Management</p>
                <p className="text-muted-foreground">
                  Protecting capital through position sizing, predefined risk, and consistency—because survival comes
                  before success.
                </p>
              </div>
              <div>
                <p className="font-semibold">Trade Management</p>
                <p className="text-muted-foreground">
                  Entry precision is important, but managing a trade is where performance is built: partials, trailing
                  logic, invalidation, and execution discipline.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Our Approach</h3>
            <p>We don’t aim to “signal” trades—we teach you how to think.</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong>Clarity over complexity</strong> (clean rules, not endless indicators)
              </li>
              <li>
                <strong>Process over hype</strong> (repeatable execution and journaling)
              </li>
              <li>
                <strong>Consistency over shortcuts</strong> (habits that perform in any market condition)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Our Mission</h3>
            <p>
              To help traders develop <strong>confidence, discipline, and a market-ready framework</strong>—so they can
              trade with structure, not emotions.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">A Quick Note (Important)</h3>
            <p>
              Epic Trader provides <strong>educational content only</strong>. Trading involves risk, and there are no
              guaranteed outcomes. Always trade responsibly and only with risk capital.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Ready to level up?</h3>
            <p>
              If you’re done with guessing and ready to understand price the way professionals frame it, you’re in the
              right place. Welcome to Epic Trader.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
