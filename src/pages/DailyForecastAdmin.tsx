import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
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

const DailyForecastAdmin = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [structure, setStructure] = useState("");
  const [poi, setPoi] = useState("");
  const [notes, setNotes] = useState("");
  const [marketName, setMarketName] = useState("");
  const [pairName, setPairName] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [selectedPair, setSelectedPair] = useState("");
  const [pairMarketId, setPairMarketId] = useState("");
  const [date, setDate] = useState("");
  const [session, setSession] = useState("London");
  const [time, setTime] = useState("");
  const [store, setStore] = useState<ForecastStore>({ markets: [], forecasts: [] });

  const selectedMarket = useMemo(
    () => store.markets.find((m) => m.id === selectedMarketId) ?? null,
    [store.markets, selectedMarketId],
  );

  useEffect(() => {
    if (selectedMarket && !selectedMarket.pairs.includes(selectedPair)) {
      setSelectedPair(selectedMarket.pairs[0] ?? "");
    }
  }, [selectedMarket, selectedPair]);

  useEffect(() => {
    window.localStorage.setItem("epic-trader-admin", "true");
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ForecastStore;
      setStore(parsed);
      if (parsed.markets[0]) {
        setSelectedMarketId(parsed.markets[0].id);
        setPairMarketId(parsed.markets[0].id);
        setSelectedPair(parsed.markets[0].pairs[0] ?? "");
      }
    }
  }, []);

  const persistStore = (next: ForecastStore) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStore(next);
  };

  const handleAddMarket = () => {
    if (!marketName.trim()) {
      return;
    }
    const newMarket: Market = {
      id: crypto.randomUUID(),
      name: marketName.trim(),
      pairs: [],
    };
    const next = {
      ...store,
      markets: [...store.markets, newMarket],
    };
    persistStore(next);
    setMarketName("");
    setSelectedMarketId(newMarket.id);
    setPairMarketId(newMarket.id);
  };

  const handleAddPair = () => {
    if (!pairName.trim() || !pairMarketId) {
      return;
    }
    const nextMarkets = store.markets.map((market) =>
      market.id === pairMarketId && !market.pairs.includes(pairName.trim())
        ? { ...market, pairs: [...market.pairs, pairName.trim()] }
        : market,
    );
    persistStore({ ...store, markets: nextMarkets });
    setPairName("");
  };

  const handleEditMarket = (marketId: string) => {
    const current = store.markets.find((market) => market.id === marketId);
    if (!current) {
      return;
    }
    const nextName = window.prompt("Edit market name", current.name);
    if (!nextName) {
      return;
    }
    const nextMarkets = store.markets.map((market) =>
      market.id === marketId ? { ...market, name: nextName.trim() } : market,
    );
    persistStore({ ...store, markets: nextMarkets });
  };

  const handleDeleteMarket = (marketId: string) => {
    const nextMarkets = store.markets.filter((market) => market.id !== marketId);
    const nextForecasts = store.forecasts.filter((forecast) => forecast.marketId !== marketId);
    persistStore({ markets: nextMarkets, forecasts: nextForecasts });
    if (selectedMarketId === marketId) {
      setSelectedMarketId(nextMarkets[0]?.id ?? "");
      setSelectedPair(nextMarkets[0]?.pairs[0] ?? "");
    }
    if (pairMarketId === marketId) {
      setPairMarketId(nextMarkets[0]?.id ?? "");
    }
  };

  const handleEditPair = (marketId: string, pair: string) => {
    const nextPair = window.prompt("Edit pair name", pair);
    if (!nextPair) {
      return;
    }
    const nextMarkets = store.markets.map((market) =>
      market.id === marketId
        ? {
            ...market,
            pairs: market.pairs.map((p) => (p === pair ? nextPair.trim() : p)),
          }
        : market,
    );
    persistStore({
      ...store,
      markets: nextMarkets,
      forecasts: store.forecasts.map((forecast) =>
        forecast.marketId === marketId && forecast.pair === pair
          ? { ...forecast, pair: nextPair.trim() }
          : forecast,
      ),
    });
  };

  const handleDeletePair = (marketId: string, pair: string) => {
    const nextMarkets = store.markets.map((market) =>
      market.id === marketId ? { ...market, pairs: market.pairs.filter((p) => p !== pair) } : market,
    );
    const nextForecasts = store.forecasts.filter(
      (forecast) => !(forecast.marketId === marketId && forecast.pair === pair),
    );
    persistStore({ markets: nextMarkets, forecasts: nextForecasts });
    if (selectedMarketId === marketId && selectedPair === pair) {
      const nextMarket = nextMarkets.find((market) => market.id === marketId);
      setSelectedPair(nextMarket?.pairs[0] ?? "");
    }
  };

  const handleSaveForecast = async () => {
    if (!selectedMarketId || !selectedPair) {
      return;
    }

    let imageDataUrl: string | undefined;

    if (imageFile) {
      imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(imageFile);
      });
    }

    const payload: ForecastEntry = {
      id: crypto.randomUUID(),
      marketId: selectedMarketId,
      pair: selectedPair,
      date,
      session,
      time,
      imageDataUrl,
      structure,
      poi,
      notes,
      savedAt: new Date().toISOString(),
    };

    const next = {
      ...store,
      forecasts: [payload, ...store.forecasts],
    };
    persistStore(next);
  };

  return (
    <div>
      <PageHero
        title="Daily Forecast Admin"
        subtitle="Upload the latest forecast image and add Structure, POI, and supporting notes."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <Card className="hover-glow lg:col-span-2">
              <CardHeader>
                <CardTitle>Trading markets &amp; pairs</CardTitle>
                <CardDescription>Add, edit, or remove markets and currency pairs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-3">
                    <label className="text-sm font-medium" htmlFor="market-name">
                      Add trading market
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="market-name"
                        placeholder="Forex, Indices, Commodities..."
                        value={marketName}
                        onChange={(event) => setMarketName(event.target.value)}
                      />
                      <Button type="button" onClick={handleAddMarket}>
                        Add Market
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium" htmlFor="pair-name">
                      Add pair to market
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                        value={pairMarketId}
                        onChange={(event) => setPairMarketId(event.target.value)}
                      >
                        <option value="">Select market</option>
                        {store.markets.map((market) => (
                          <option key={market.id} value={market.id}>
                            {market.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="pair-name"
                        placeholder="EUR/USD, GBP/JPY..."
                        value={pairName}
                        onChange={(event) => setPairName(event.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={handleAddPair}>
                        Add Pair
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {store.markets.length ? (
                    store.markets.map((market) => (
                      <Card key={market.id} className="border bg-background/40">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-base">{market.name}</CardTitle>
                            <CardDescription>{market.pairs.length} pairs</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditMarket(market.id)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteMarket(market.id)}>
                              Delete
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {market.pairs.length ? (
                            market.pairs.map((pair) => (
                              <div key={pair} className="flex items-center justify-between rounded-md border px-3 py-2">
                                <p className="text-sm font-medium">{pair}</p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditPair(market.id, pair)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeletePair(market.id, pair)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No pairs yet.</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add your first trading market to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Daily forecast upload</CardTitle>
                <CardDescription>
                  Provide the image and key context that traders need. Saved forecasts appear below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="market-select">
                      Trading market
                    </label>
                    <select
                      id="market-select"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={selectedMarketId}
                      onChange={(event) => setSelectedMarketId(event.target.value)}
                    >
                      <option value="">Select market</option>
                      {store.markets.map((market) => (
                        <option key={market.id} value={market.id}>
                          {market.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="pair-select">
                      Currency pair
                    </label>
                    <select
                      id="pair-select"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={selectedPair}
                      onChange={(event) => setSelectedPair(event.target.value)}
                    >
                      <option value="">Select pair</option>
                      {selectedMarket?.pairs.map((pair) => (
                        <option key={pair} value={pair}>
                          {pair}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="forecast-date">
                      Date
                    </label>
                    <Input
                      id="forecast-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="forecast-session">
                      Session
                    </label>
                    <select
                      id="forecast-session"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={session}
                      onChange={(event) => setSession(event.target.value)}
                    >
                      <option value="Asia">Asia</option>
                      <option value="London">London</option>
                      <option value="New York">New York</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="forecast-time">
                      Time (optional)
                    </label>
                    <Input
                      id="forecast-time"
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="forecast-image">
                    Forecast image
                  </label>
                  <Input
                    id="forecast-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="structure-notes">
                    Structure
                  </label>
                  <Textarea
                    id="structure-notes"
                    placeholder="Describe market structure, bias, and key levels."
                    rows={4}
                    value={structure}
                    onChange={(event) => setStructure(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="poi-notes">
                    POI (Points of Interest)
                  </label>
                  <Textarea
                    id="poi-notes"
                    placeholder="Highlight POIs, liquidity zones, and timing windows."
                    rows={4}
                    value={poi}
                    onChange={(event) => setPoi(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="extra-notes">
                    Additional notes
                  </label>
                  <Textarea
                    id="extra-notes"
                    placeholder="Risk plan, invalidation rules, and session notes."
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>

                <Button type="button" className="rounded-full px-6" onClick={handleSaveForecast}>
                  Save forecast
                </Button>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Uploaded image preview.</CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Daily forecast preview"
                    className="h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    Upload an image to see the preview here.
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal delayMs={180}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Live forecast (website)</CardTitle>
              <CardDescription>
                This is what visitors will see after you save forecasts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.forecasts.length ? (
                store.forecasts.map((forecast) => {
                  const market = store.markets.find((m) => m.id === forecast.marketId);
                  return (
                    <div key={forecast.id} className="grid gap-6 rounded-xl border p-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-3">
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
                      </div>
                      <div>
                        {forecast.imageDataUrl ? (
                          <img
                            src={forecast.imageDataUrl}
                            alt="Saved daily forecast"
                            className="h-64 w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                            No image saved yet.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                  Save a forecast to show it here.
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};

export default DailyForecastAdmin;
