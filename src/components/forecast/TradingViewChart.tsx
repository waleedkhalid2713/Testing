import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
type Props = { symbol: string; timeframe: string };

export function TradingViewChart({ symbol, timeframe }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
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
      <div className="relative min-h-[520px] overflow-hidden rounded-xl border bg-slate-950">
        {!loaded && !failed ? <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">Loading TradingView chart…</div> : null}
        <iframe
          title={`TradingView chart for ${symbol}`}
          src={src}
          className="h-[520px] w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => { setLoaded(true); setFailed(false); }}
          onError={() => setFailed(true)}
        />
      </div>
      {failed ? <Alert variant="destructive"><AlertTitle>Chart unavailable</AlertTitle><AlertDescription>TradingView could not load. Check the symbol, exchange, connection, or continue with uploaded evidence.</AlertDescription></Alert> : null}
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Use TradingView’s symbol search to find the correct market, then confirm the complete symbol in the TradingView Symbol field before saving.</p>
        <p>TradingView validates market availability inside the chart. Confirm that the selected chart loads correctly before saving.</p>
        <p>Drawing objects, internal symbol changes, and chart screenshots are not read by this application.</p>
      </div>
    </div>
  );
}
