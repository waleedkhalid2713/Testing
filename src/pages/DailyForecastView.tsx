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
type ForecastWithInstrument = Forecast & { instrument: Instrument | undefined; imageUrl: string };

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
  const [error, setError] = useState("");
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const loadForecasts = async () => {
      const [{ data: instrumentRows, error: instrumentError }, { data: forecastRows, error: forecastError }] =
        await Promise.all([
          supabase.from("trading_instruments").select("*").eq("is_active", true).order("display_order"),
          supabase.from("trading_forecasts").select("*").order("published_at", { ascending: false }),
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
      })),
    [forecasts, instruments],
  );

  const filtered = useMemo(
    () =>
      enrichedForecasts.filter((forecast) => {
        if (market && forecast.instrument?.market !== market) return false;
        if (instrumentId && forecast.instrument_id !== instrumentId) return false;
        if (status && forecast.status !== status) return false;
        return true;
      }),
    [enrichedForecasts, instrumentId, market, status],
  );

  return (
    <div>
      <PageHero
        title="Daily Trade Forecasts"
        subtitle="View confirmed execution, stop-loss, take-profit, and result information from the Epic Trader team."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Markets we cover</CardTitle>
            <CardDescription>
              {supportedMarkets.length ? supportedMarkets.join(", ") : "Loading supported markets…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
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
              <label className="text-sm font-medium" htmlFor="filter-result">Result</label>
              <select id="filter-result" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All results</option>
                <option value="active">Active</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </CardContent>
          {isAdmin ? <CardContent className="border-t pt-6"><Button asChild className="rounded-full"><Link to="/daily-forecast">Publish or edit forecasts</Link></Button></CardContent> : null}
        </Card>

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
                <div className="p-6 pt-0 lg:pt-6"><img src={forecast.imageUrl} alt={`${forecast.instrument?.symbol ?? "Trade"} TradingView setup`} className="h-72 w-full rounded-xl object-cover" loading="lazy" /></div>
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
