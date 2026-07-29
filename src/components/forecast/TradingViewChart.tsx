import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = { symbol: string; timeframe: string; context?: "admin" | "forecast" };

export function TradingViewChart({ symbol, timeframe, context = "admin" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const src = useMemo(() => {
    const query = new URLSearchParams({
      symbol,
      interval: timeframe,
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#0b1220",
      enable_publishing: "false",
      hide_side_toolbar: "false",
      allow_symbol_change: "true",
      save_image: "false",
      withdateranges: "true",
      details: "true",
      calendar: "false",
    });
    return `https://s.tradingview.com/widgetembed/?${query.toString()}`;
  }, [symbol, timeframe]);

  useEffect(() => { setLoaded(false); setFailed(false); }, [src]);
  useEffect(() => {
    if (loaded || failed || !symbol) return;
    const timeout = window.setTimeout(() => setFailed(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, [failed, loaded, src, symbol]);

  if (!symbol) return <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">Choose an instrument to load its chart.</div>;

  return (
    <div className="space-y-2">
      <div className="relative min-h-[420px] overflow-hidden rounded-xl border bg-slate-950 sm:min-h-[520px]">
        {!loaded && !failed ? <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">Loading TradingView chart…</div> : null}
        <iframe
          key={retryKey}
          title={`TradingView chart for ${symbol}`}
          src={src}
          className="h-[420px] w-full sm:h-[520px]"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => { setLoaded(true); setFailed(false); }}
          onError={() => setFailed(true)}
        />
      </div>
      {failed ? <Alert variant="destructive"><AlertTitle>Live chart could not be loaded</AlertTitle><AlertDescription className="space-y-3"><p>Forecast details remain available. The market may be closed, the symbol may be unavailable, or TradingView may be temporarily unreachable.</p><Button type="button" size="sm" variant="outline" onClick={() => { setFailed(false); setLoaded(false); setRetryKey((current) => current + 1); }}>Retry chart</Button></AlertDescription></Alert> : null}
      <div className="space-y-1 text-xs text-muted-foreground">
        {context === "admin" ? <p>Use TradingView’s symbol search to find the correct market, then confirm the complete symbol in the TradingView Symbol field before saving.</p> : null}
        <p>{context === "admin" ? "TradingView validates market availability inside the chart. Confirm that the selected chart loads correctly before saving." : "TradingView validates market availability inside the chart; forecast details remain available if the market is closed or unavailable."}</p>
        <p>Drawing objects, internal symbol changes, and chart screenshots are not read by this application.</p>
      </div>
    </div>
  );
}
