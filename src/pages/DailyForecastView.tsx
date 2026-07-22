import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Instrument = Tables<"trading_instruments">;
type Forecast = Tables<"trading_forecasts">;
type ForecastWithInstrument = Forecast & { instrument: Instrument | undefined; imageUrl: string; resultImageUrl: string | null };
type ForecastAccess = "loading" | "sign-in" | "needs-acceptance" | "granted";

const resultVariant = (status: string) => {
  if (status === "win") return "default";
  if (status === "loss") return "destructive";
  return "secondary";
};

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });

const DailyForecastView = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [marketType, setMarketType] = useState("");
  const [subMarket, setSubMarket] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState<ForecastWithInstrument | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<"setup" | "result">("setup");
  const [forecastAccess, setForecastAccess] = useState<ForecastAccess>("loading");
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isAcceptingDisclaimer, setIsAcceptingDisclaimer] = useState(false);
  const [error, setError] = useState("");
  const { isAdmin } = useAdmin();

  const loadForecasts = async () => {
    const [{ data: instrumentRows, error: instrumentError }, { data: forecastRows, error: forecastError }] =
      await Promise.all([
        supabase.from("trading_instruments").select("*").eq("is_active", true).order("display_order"),
        supabase.from("trading_forecasts").select("*").order("trade_date", { ascending: false }),
      ]);

    if (instrumentError || forecastError) {
      setError("Forecasts are not available yet. Please try again later.");
      return;
    }

    setInstruments(instrumentRows ?? []);
    setForecasts(forecastRows ?? []);
  };

  useEffect(() => {
    const checkForecastAccess = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError("Unable to check your forecast access. Please sign in again.");
        setForecastAccess("sign-in");
        return;
      }

      if (!user) {
        setForecastAccess("sign-in");
        return;
      }

      const { data: hasAccepted, error: accessError } = await supabase.rpc("has_accepted_forecast_disclaimer");

      if (accessError) {
        setError("Unable to load your disclaimer status. Please try again.");
        setForecastAccess("needs-acceptance");
        return;
      }

      if (!hasAccepted) {
        setForecastAccess("needs-acceptance");
        return;
      }

      setForecastAccess("granted");
      await loadForecasts();
    };

    void checkForecastAccess();
  }, []);

  const acceptDisclaimer = async () => {
    if (!hasAcceptedDisclaimer) {
      return;
    }

    setIsAcceptingDisclaimer(true);
    setError("");

    const { error: acceptanceError } = await supabase.rpc("accept_forecast_disclaimer");
    if (acceptanceError) {
      setError(acceptanceError.message);
      setIsAcceptingDisclaimer(false);
      return;
    }

    setForecastAccess("granted");
    setIsAcceptingDisclaimer(false);
    await loadForecasts();
  };

  const marketTypes = useMemo(
    () => [...new Set(instruments.map((instrument) => instrument.market_type))],
    [instruments],
  );

  const subMarkets = useMemo(
    () => [...new Set(
      instruments
        .filter((instrument) => !marketType || instrument.market_type === marketType)
        .map((instrument) => instrument.sub_market),
    )],
    [instruments, marketType],
  );

  const availableInstruments = useMemo(
    () => instruments.filter((instrument) =>
      (!marketType || instrument.market_type === marketType) &&
      (!subMarket || instrument.sub_market === subMarket),
    ),
    [instruments, marketType, subMarket],
  );

  const enrichedForecasts = useMemo<ForecastWithInstrument[]>(
    () =>
      forecasts.map((forecast) => ({
        ...forecast,
        instrument: instruments.find((instrument) => instrument.id === forecast.instrument_id),
        imageUrl: supabase.storage.from("forecast-images").getPublicUrl(forecast.image_path).data.publicUrl,
        resultImageUrl: forecast.result_image_path
          ? supabase.storage.from("forecast-images").getPublicUrl(forecast.result_image_path).data.publicUrl
          : null,
      })),
    [forecasts, instruments],
  );

  const filtered = useMemo(
    () =>
      enrichedForecasts.filter((forecast) => {
        if (marketType && forecast.instrument?.market_type !== marketType) return false;
        if (subMarket && forecast.instrument?.sub_market !== subMarket) return false;
        if (instrumentId && forecast.instrument_id !== instrumentId) return false;
        if (status && forecast.status !== status) return false;
        if (startDate && forecast.trade_date < startDate) return false;
        if (endDate && forecast.trade_date > endDate) return false;
        return true;
      }),
    [enrichedForecasts, endDate, instrumentId, marketType, startDate, status, subMarket],
  );

  const analysis = useMemo(() => {
    const active = filtered.filter((forecast) => forecast.status === "active").length;
    const wins = filtered.filter((forecast) => forecast.status === "win").length;
    const completed = filtered.filter((forecast) => forecast.status === "win" || forecast.status === "loss").length;
    const winRate = completed ? Math.round((wins / completed) * 100) : null;

    const byInstrument = new Map<string, { label: string; total: number; wins: number; completed: number }>();
    filtered.forEach((forecast) => {
      const label = forecast.instrument?.symbol ?? "Unknown";
      const current = byInstrument.get(forecast.instrument_id) ?? { label, total: 0, wins: 0, completed: 0 };
      current.total += 1;
      if (forecast.status === "win") current.wins += 1;
      if (forecast.status === "win" || forecast.status === "loss") current.completed += 1;
      byInstrument.set(forecast.instrument_id, current);
    });

    const instrumentsSummary = [...byInstrument.values()]
      .map((item) => ({ ...item, winRate: item.completed ? Math.round((item.wins / item.completed) * 100) : null }))
      .sort((first, second) => second.total - first.total);

    return { active, completed, instrumentsSummary, winRate, wins };
  }, [filtered]);

  const resetFilters = () => {
    setMarketType("");
    setSubMarket("");
    setInstrumentId("");
    setStatus("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      <PageHero
        title="Daily Trade Forecasts"
        subtitle="Explore the Epic Trader team's published setups, outcomes, and market analysis."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      {forecastAccess === "granted" ? (
        <div className="container py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Forecast dashboard</CardTitle>
            <CardDescription>
              Narrow forecasts from market type through sub-market and instrument, then filter by outcome or date.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-market-type">Market type</label>
              <select id="filter-market-type" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={marketType} onChange={(event) => { setMarketType(event.target.value); setSubMarket(""); setInstrumentId(""); }}>
                <option value="">All types</option>
                {marketTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-sub-market">Sub-market</label>
              <select id="filter-sub-market" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={subMarket} onChange={(event) => { setSubMarket(event.target.value); setInstrumentId(""); }}>
                <option value="">All sub-markets</option>
                {subMarkets.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-instrument">Instrument</label>
              <select id="filter-instrument" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)}>
                <option value="">All instruments</option>
                {availableInstruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.symbol} — {instrument.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-status">Result</label>
              <select id="filter-status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All results</option>
                <option value="active">Active</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-start-date">From date</label>
              <input id="filter-start-date" type="date" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-end-date">To date</label>
              <input id="filter-end-date" type="date" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>Clear filters</Button>
            </div>
          </CardContent>
          {isAdmin ? <CardContent className="border-t pt-6"><Button asChild className="rounded-full"><Link to="/daily-forecast">Publish or edit forecasts</Link></Button></CardContent> : null}
        </Card>

        <section className="mb-8" aria-labelledby="forecast-analysis">
          <div className="mb-4">
            <h2 id="forecast-analysis" className="text-2xl font-semibold">Forecast analysis</h2>
            <p className="text-sm text-muted-foreground">Results are based only on the forecasts shown by your selected filters.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Published forecasts</p><p className="mt-2 text-3xl font-semibold">{filtered.length}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active forecasts</p><p className="mt-2 text-3xl font-semibold">{analysis.active}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Completed forecasts</p><p className="mt-2 text-3xl font-semibold">{analysis.completed}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Win rate</p><p className="mt-2 text-3xl font-semibold">{analysis.winRate === null ? "—" : `${analysis.winRate}%`}</p><p className="mt-1 text-xs text-muted-foreground">{analysis.wins} confirmed wins</p></CardContent></Card>
          </div>
          {analysis.instrumentsSummary.length > 1 ? (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">Instrument performance</CardTitle><CardDescription>Completed-result win rate by instrument.</CardDescription></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {analysis.instrumentsSummary.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.total} forecast{item.total === 1 ? "" : "s"}</p>
                    <p className="mt-2 text-sm">Win rate: <span className="font-semibold">{item.winRate === null ? "—" : `${item.winRate}%`}</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </section>

        {error ? <p className="mb-6 text-sm text-destructive">{error}</p> : null}

        <div className="space-y-6">
          {filtered.length ? filtered.map((forecast) => (
            <Card key={forecast.id} className="overflow-hidden">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <CardContent className="space-y-5 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">{forecast.instrument ? `${forecast.instrument.market_type} · ${forecast.instrument.sub_market}` : "Market"}</p>
                      <h2 className="text-xl font-semibold">{forecast.instrument?.symbol ?? "Unknown instrument"}</h2>
                      {forecast.instrument?.name ? <p className="text-sm text-muted-foreground">{forecast.instrument.name}</p> : null}
                    </div>
                    <Badge variant={resultVariant(forecast.status)}>{forecast.status.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm sm:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Direction</p><p className="font-semibold capitalize">{forecast.direction}</p></div>
                    <div><p className="text-xs text-muted-foreground">Execution</p><p className="font-semibold">{numberFormat.format(forecast.execution_price)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Stop loss</p><p className="font-semibold">{numberFormat.format(forecast.stop_loss)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Take profit 1</p><p className="font-semibold">{numberFormat.format(forecast.take_profit_1)}</p></div>
                  </div>

                  {forecast.take_profit_2 ? <p className="text-sm"><span className="text-muted-foreground">Take profit 2: </span><span className="font-semibold">{numberFormat.format(forecast.take_profit_2)}</span></p> : null}
                  <p className="text-sm text-muted-foreground">Published for {new Date(forecast.trade_date + "T00:00:00").toLocaleDateString()}.</p>
                  {forecast.notes ? <p className="text-sm text-muted-foreground">{forecast.notes}</p> : null}
                </CardContent>
                <div className="p-6 pt-0 lg:pt-6">
                  <button type="button" className="block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { setSelectedImageType("setup"); setSelectedScreenshot(forecast); }} aria-label={`Open ${forecast.instrument?.symbol ?? "trade"} setup screenshot`}>
                    <img src={forecast.imageUrl} alt={`${forecast.instrument?.symbol ?? "Trade"} TradingView setup`} className="h-72 w-full object-cover transition-transform hover:scale-[1.02]" loading="lazy" />
                  </button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">Click the screenshot to enlarge it.</p>
                  {forecast.resultImageUrl ? (
                    <div className="mt-5 border-t pt-5">
                      <p className="mb-2 text-sm font-medium">Result evidence</p>
                      <button type="button" className="block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { setSelectedImageType("result"); setSelectedScreenshot(forecast); }} aria-label={`Open ${forecast.instrument?.symbol ?? "trade"} result screenshot`}>
                        <img src={forecast.resultImageUrl} alt={`${forecast.instrument?.symbol ?? "Trade"} result screenshot`} className="h-48 w-full object-cover transition-transform hover:scale-[1.02]" loading="lazy" />
                      </button>
                      <p className="mt-2 text-center text-xs text-muted-foreground">Admin-provided result screenshot. Click to enlarge it.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          )) : (
            <Card><CardContent className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">No published forecasts match these filters yet.</CardContent></Card>
          )}
        </div>
      </div>

      <Dialog open={Boolean(selectedScreenshot)} onOpenChange={(open) => { if (!open) setSelectedScreenshot(null); }}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScreenshot?.instrument?.symbol ?? "Trade"} {selectedImageType === "result" ? "result screenshot" : "setup screenshot"}</DialogTitle>
            <DialogDescription>
              {selectedScreenshot?.instrument ? `${selectedScreenshot.instrument.market_type} · ${selectedScreenshot.instrument.sub_market} · ${selectedScreenshot.instrument.name}` : "Published forecast image"}
            </DialogDescription>
          </DialogHeader>
          {selectedScreenshot ? <img src={selectedImageType === "result" ? selectedScreenshot.resultImageUrl ?? selectedScreenshot.imageUrl : selectedScreenshot.imageUrl} alt={`${selectedScreenshot.instrument?.symbol ?? "Trade"} ${selectedImageType === "result" ? "result screenshot" : "TradingView setup"}`} className="max-h-[70vh] w-full rounded-lg object-contain" /> : null}
        </DialogContent>
      </Dialog>
        </div>
      ) : (
        <div className="container py-12">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Forecast disclaimer</CardTitle>
              <CardDescription>Acceptance is required before the forecast section is shown.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {forecastAccess === "loading" ? <p className="text-sm text-muted-foreground">Checking your forecast access…</p> : null}
              {forecastAccess === "sign-in" ? (
                <>
                  <p className="text-sm text-muted-foreground">Please sign in to read and accept the forecast disclaimer.</p>
                  <Button asChild className="rounded-full"><Link to="/auth">Sign in to continue</Link></Button>
                </>
              ) : null}
              {forecastAccess === "needs-acceptance" ? (
                <>
                  <p className="text-sm leading-6">
                    All forecasts are provided solely for educational purposes and do not constitute financial or investment advice. You accept full responsibility for your own trading decisions.
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm leading-6">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={hasAcceptedDisclaimer}
                      onChange={(event) => setHasAcceptedDisclaimer(event.target.checked)}
                    />
                    <span>I understand and accept this forecast disclaimer.</span>
                  </label>
                  <Button type="button" className="rounded-full" disabled={!hasAcceptedDisclaimer || isAcceptingDisclaimer} onClick={() => void acceptDisclaimer()}>
                    {isAcceptingDisclaimer ? "Saving acceptance…" : "Accept and view forecasts"}
                  </Button>
                </>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DailyForecastView;