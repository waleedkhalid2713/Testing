import { useState } from "react";

import { TradingViewChart } from "@/components/forecast/TradingViewChart";
import { Button } from "@/components/ui/button";
import { getForecastTradingViewSymbol } from "@/lib/forecastTradingViewSymbols";

type Props = {
  instrumentCode: string;
  storedSymbol?: string | null;
  timeframe?: string | null;
  status: string;
};

export function ForecastLiveMarketSection({ instrumentCode, storedSymbol, timeframe, status }: Props) {
  const [expanded, setExpanded] = useState(false);
  const symbol = getForecastTradingViewSymbol(instrumentCode, storedSymbol);
  const completed = status !== "active";

  return (
    <section className="mt-5 min-w-0 border-t pt-5" aria-label={completed ? "Current Market Chart" : "Live TradingView Chart"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{completed ? "Current Market Chart" : "Live TradingView Chart"}</h3>
          {completed ? <p className="text-xs text-muted-foreground">This chart shows the current market, not the market when this forecast closed.</p> : null}
        </div>
        {symbol ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setExpanded((current) => !current)}>
            {expanded ? "Hide Live Chart" : "View Live Chart"}
          </Button>
        ) : null}
      </div>

      {!symbol ? <p className="mt-3 text-sm text-muted-foreground">Live chart is currently unavailable for this instrument.</p> : null}
      {expanded && symbol ? (
        <div className="mt-4 min-w-0 overflow-hidden rounded-xl border bg-card p-2 sm:p-3">
          <TradingViewChart symbol={symbol} timeframe={timeframe || "60"} context="forecast" />
        </div>
      ) : null}
    </section>
  );
}
