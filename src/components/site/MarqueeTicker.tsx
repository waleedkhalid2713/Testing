import * as React from "react";

const DISCLAIMER_TEXT =
  "Educational content only. Not financial advice. Trading involves risk. Past performance is not indicative of future results.";

export function MarqueeTicker({ text = DISCLAIMER_TEXT }: { text?: string }) {
  return (
    <div
      className="risk-ticker fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="note"
      aria-label="Risk disclaimer"
    >
      <div className="overflow-hidden">
        <div className="marquee flex w-max gap-10 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <p key={i} className="whitespace-nowrap text-sm font-semibold text-primary sm:text-base">
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
