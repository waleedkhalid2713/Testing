import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Instrument = Tables<"trading_instruments">;
type Forecast = Tables<"trading_forecasts">;
type ForecastWithInstrument = Forecast & {
  instrument: Instrument | undefined;
  imageUrl: string;
  resultImageUrl: string | null;
  isHistorical: boolean;
};

const resultVariant = (status: string) => {
  if (status === "win") return "default";
  if (status === "loss") return "destructive";
  return "secondary";
};

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });

const DailyForecastView = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [market, setMarket] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const { isAdmin } = useAdmin();

  useEffect(() => {
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

    void loadForecasts();
  }, []);

  const supportedMarkets = useMemo(
    () => [...new Set(instruments.map((instrument) => instrument.market))],
    [instruments],
  );

  const availableInstruments = useMemo(
    () => instruments.filter((instrument) => !market || instrument.market === market),
    [instruments, market],
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
        isHistorical: forecast.trade_date < forecast.created_at.slice(0, 10),
      })),
    [forecasts, instruments],
  );

  const filtered = useMemo(
    () =>
      enrichedForecasts.filter((forecast) => {
        if (market && forecast.instrument?.market !== market) return false;
        if (instrumentId && forecast.instrument_id !== instrumentId) return false;
        if (status && forecast.status !== status) return false;
        if (startDate && forecast.trade_date < startDate) return false;
        if (endDate && forecast.trade_date > endDate) return false;
        return true;
      }),
    [enrichedForecasts, endDate, instrumentId, market, startDate, status],
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
      .map((item) => ({
        ...item,
        winRate: item.completed ? Math.round((item.wins / item.completed) * 100) : null,
      }))
      .sort((first, second) => second.total - first.total);

    return { active, completed, instrumentsSummary, winRate, wins };
  }, [filtered]);

  const resetFilters = () => {
    setMarket("");
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

      <div className="container py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Forecast dashboard</CardTitle>
            <CardDescription>
              Filter public forecasts by market, instrument, outcome, or a trade-date range.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-market">Market</label>
              <select id="filter-market" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={market} onChange={(event) => { setMarket(event.target.value); setInstrumentId(""); }}>
                <option value="">All markets</option>
                {supportedMarkets.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-instrument">Instrument</label>
              <select id="filter-instrument" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)}>
                <option value="">All instruments</option>
                {availableInstruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.symbol}</option>)}
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
                      <p className="text-xs uppercase text-muted-foreground">{forecast.instrument?.market ?? "Market"}</p>
                      <h2 className="text-xl font-semibold">{forecast.instrument?.symbol ?? "Unknown instrument"}</h2>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {forecast.isHistorical ? <Badge variant="outline">HISTORICAL TRADE</Badge> : null}
                      <Badge variant={resultVariant(forecast.status)}>{forecast.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm sm:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Direction</p><p className="font-semibold capitalize">{forecast.direction}</p></div>
                    <div><p className="text-xs text-muted-foreground">Execution</p><p className="font-semibold">{numberFormat.format(forecast.execution_price)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Stop loss</p><p className="font-semibold">{numberFormat.format(forecast.stop_loss)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Take profit 1</p><p className="font-semibold">{numberFormat.format(forecast.take_profit_1)}</p></div>
                  </div>

                  {forecast.take_profit_2 ? <p className="text-sm"><span className="text-muted-foreground">Take profit 2: </span><span className="font-semibold">{numberFormat.format(forecast.take_profit_2)}</span></p> : null}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Trade date: {new Date(forecast.trade_date + "T00:00:00").toLocaleDateString()}.</p>
                    <p>{forecast.isHistorical ? "Added to archive" : "Published"}: {new Date(forecast.created_at).toLocaleDateString()}.</p>
                    {forecast.result_confirmed_at ? <p>Result confirmed: {new Date(forecast.result_confirmed_at).toLocaleDateString()}.</p> : null}
                  </div>
                  {forecast.notes ? <p className="text-sm text-muted-foreground">{forecast.notes}</p> : null}
                </CardContent>
                <div className="grid gap-4 p-6 pt-0 lg:pt-6">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Setup screenshot</p>
                    <img src={forecast.imageUrl} alt={`${forecast.instrument?.symbol ?? "Trade"} TradingView setup`} className="h-64 w-full rounded-xl object-cover" loading="lazy" />
                  </div>
                  {forecast.resultImageUrl ? (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Result screenshot</p>
                      <img src={forecast.resultImageUrl} alt={`${forecast.instrument?.symbol ?? "Trade"} result evidence`} className="h-64 w-full rounded-xl object-cover" loading="lazy" />
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
    </div>
  );
};

export default DailyForecastView;
