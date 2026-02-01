import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-forecast-daily.jpg";

type Market = {
  id: string;
  name: string;
  pairs: string[];
};

type ForecastEntry = {
  id: string;
  marketId: string;
  pair: string;
  date: string;
  session: string;
  time: string;
  structure: string;
  poi: string;
  notes: string;
  imageDataUrl?: string;
  savedAt: string;
};

type ForecastStore = {
  markets: Market[];
  forecasts: ForecastEntry[];
};

const STORAGE_KEY = "epic-trader-forecast-store";

const DailyForecastView = () => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const store = stored ? (JSON.parse(stored) as ForecastStore) : { markets: [], forecasts: [] };

  const [marketId, setMarketId] = useState(store.markets[0]?.id ?? "");
  const [pair, setPair] = useState(store.markets[0]?.pairs[0] ?? "");
  const [date, setDate] = useState("");
  const [session, setSession] = useState("");
  const [time, setTime] = useState("");

  const availablePairs = useMemo(() => {
    const market = store.markets.find((m) => m.id === marketId);
    return market?.pairs ?? [];
  }, [marketId, store.markets]);

  const filtered = useMemo(
    () =>
      store.forecasts.filter((forecast) => {
        if (marketId && forecast.marketId !== marketId) {
          return false;
        }
        if (pair && forecast.pair !== pair) {
          return false;
        }
        if (date && forecast.date !== date) {
          return false;
        }
        if (session && forecast.session !== session) {
          return false;
        }
        if (time && forecast.time !== time) {
          return false;
        }
        return true;
      }),
    [date, marketId, pair, session, time, store.forecasts],
  );

  return (
    <div>
      <PageHero
        title="Daily Forecasts"
        subtitle="Filter by market, pair, date, session, and time to view the latest outlook."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Forecast filters</CardTitle>
            <CardDescription>Select a market and pair, then filter by date or session.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-market">
                Trading market
              </label>
              <select
                id="filter-market"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={marketId}
                onChange={(event) => {
                  const nextMarketId = event.target.value;
                  setMarketId(nextMarketId);
                  const nextMarket = store.markets.find((m) => m.id === nextMarketId);
                  setPair(nextMarket?.pairs[0] ?? "");
                }}
              >
                <option value="">All markets</option>
                {store.markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-pair">
                Currency pair
              </label>
              <select
                id="filter-pair"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={pair}
                onChange={(event) => setPair(event.target.value)}
              >
                <option value="">All pairs</option>
                {availablePairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-date">
                Date
              </label>
              <input
                id="filter-date"
                type="date"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-session">
                Session
              </label>
              <select
                id="filter-session"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={session}
                onChange={(event) => setSession(event.target.value)}
              >
                <option value="">All sessions</option>
                <option value="Asia">Asia</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="filter-time">
                Time
              </label>
              <input
                id="filter-time"
                type="time"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {filtered.length ? (
            filtered.map((forecast) => {
              const market = store.markets.find((m) => m.id === forecast.marketId);
              return (
                <Card key={forecast.id} className="overflow-hidden">
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Market</p>
                        <p className="text-sm font-semibold">{market?.name ?? "Unknown market"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Pair</p>
                        <p className="text-sm font-semibold">{forecast.pair}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Date: {forecast.date || "N/A"}</span>
                        <span>Session: {forecast.session || "N/A"}</span>
                        <span>Time: {forecast.time || "N/A"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Structure</p>
                        <p className="text-sm text-muted-foreground">{forecast.structure}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">POI</p>
                        <p className="text-sm text-muted-foreground">{forecast.poi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Additional notes</p>
                        <p className="text-sm text-muted-foreground">{forecast.notes}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saved {new Date(forecast.savedAt).toLocaleString()}
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0 lg:pt-6">
                      {forecast.imageDataUrl ? (
                        <img
                          src={forecast.imageDataUrl}
                          alt="Forecast"
                          className="h-64 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                          No image provided.
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No forecasts match the selected filters yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyForecastView;
