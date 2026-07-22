import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { compressForecastImage, fileToDataUrl } from "@/lib/compressForecastImage";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Instrument = Tables<"trading_instruments">;
type Forecast = Tables<"trading_forecasts">;
type TradeStatus = "active" | "win" | "loss";

type Extraction = {
  market: string | null;
  symbol: string | null;
  direction: "long" | "short" | null;
  executionPrice: number | null;
  stopLoss: number | null;
  takeProfit1: number | null;
  takeProfit2: number | null;
  status: TradeStatus;
  notes: string;
  confidence: "high" | "medium" | "low";
};

type FormState = {
  instrumentId: string;
  direction: "long" | "short";
  executionPrice: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  status: TradeStatus;
  tradeDate: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): FormState => ({
  instrumentId: "",
  direction: "long",
  executionPrice: "",
  stopLoss: "",
  takeProfit1: "",
  takeProfit2: "",
  status: "active",
  tradeDate: today(),
  notes: "",
});

const normaliseSymbol = (symbol: string) => symbol.replace(/[^a-z0-9]/gi, "").toLowerCase();

const DailyForecastAdmin = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingForecast, setEditingForecast] = useState<Forecast | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedInstrument = useMemo(
    () => instruments.find((instrument) => instrument.id === form.instrumentId) ?? null,
    [form.instrumentId, instruments],
  );

  const loadData = async () => {
    const [{ data: instrumentRows, error: instrumentError }, { data: forecastRows, error: forecastError }] =
      await Promise.all([
        supabase.from("trading_instruments").select("*").eq("is_active", true).order("display_order"),
        supabase.from("trading_forecasts").select("*").order("published_at", { ascending: false }),
      ]);

    if (instrumentError || forecastError) {
      setError("Unable to load forecasts. Run the new Supabase SQL file first.");
      return;
    }

    setInstruments(instrumentRows ?? []);
    setForecasts(forecastRows ?? []);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const setField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageChange = async (file: File | undefined) => {
    setError("");
    setMessage("");
    setExtraction(null);

    if (!file) {
      return;
    }

    try {
      const compressed = await compressForecastImage(file);
      setImageFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setMessage(`Image prepared: ${Math.ceil(compressed.size / 1024)} KB. It will use less storage.`);
    } catch (imageError) {
      setImageFile(null);
      setPreviewUrl(null);
      setError(imageError instanceof Error ? imageError.message : "Unable to prepare this image.");
    }
  };

  const handleReadImage = async () => {
    if (!imageFile) {
      setError("Upload a TradingView image before asking AI to read it.");
      return;
    }

    setIsReadingImage(true);
    setError("");
    setMessage("");

    try {
      const image = await fileToDataUrl(imageFile);
      const { data, error: functionError } = await supabase.functions.invoke("analyze-trade-image", {
        body: { image },
      });

      if (functionError || data?.error) {
        throw new Error(data?.error ?? functionError?.message ?? "AI could not read this image.");
      }

      const nextExtraction = data?.extraction as Extraction | undefined;
      if (!nextExtraction) {
        throw new Error("AI did not return trade values.");
      }

      setExtraction(nextExtraction);
      const matchedInstrument = instruments.find(
        (instrument) =>
          nextExtraction.symbol &&
          normaliseSymbol(instrument.symbol) === normaliseSymbol(nextExtraction.symbol),
      );

      setForm((current) => ({
        ...current,
        instrumentId: matchedInstrument?.id ?? current.instrumentId,
        direction: nextExtraction.direction ?? current.direction,
        executionPrice: nextExtraction.executionPrice?.toString() ?? current.executionPrice,
        stopLoss: nextExtraction.stopLoss?.toString() ?? current.stopLoss,
        takeProfit1: nextExtraction.takeProfit1?.toString() ?? current.takeProfit1,
        takeProfit2: nextExtraction.takeProfit2?.toString() ?? current.takeProfit2,
        status: nextExtraction.status ?? current.status,
        notes: nextExtraction.notes || current.notes,
      }));

      setMessage(
        matchedInstrument
          ? `AI filled the visible values (${nextExtraction.confidence} confidence). Please check them before publishing.`
          : "AI read the image, but you must choose one of the supported instruments before publishing.",
      );
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "AI could not read this image.");
    } finally {
      setIsReadingImage(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm());
    setImageFile(null);
    setPreviewUrl(null);
    setExtraction(null);
    setEditingForecast(null);
  };

  const handleEdit = (forecast: Forecast) => {
    setEditingForecast(forecast);
    setForm({
      instrumentId: forecast.instrument_id,
      direction: forecast.direction as "long" | "short",
      executionPrice: forecast.execution_price.toString(),
      stopLoss: forecast.stop_loss.toString(),
      takeProfit1: forecast.take_profit_1.toString(),
      takeProfit2: forecast.take_profit_2?.toString() ?? "",
      status: forecast.status as TradeStatus,
      tradeDate: forecast.trade_date,
      notes: forecast.notes,
    });
    setPreviewUrl(supabase.storage.from("forecast-images").getPublicUrl(forecast.image_path).data.publicUrl);
    setImageFile(null);
    setExtraction((forecast.ai_extraction as Extraction | null) ?? null);
    setError("");
    setMessage("You are editing a published forecast. Upload a new image only if you want to replace it.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (forecast: Forecast) => {
    if (!window.confirm("Delete this forecast and its image?")) {
      return;
    }

    setError("");
    const { error: deleteError } = await supabase.from("trading_forecasts").delete().eq("id", forecast.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    const { error: storageError } = await supabase.storage.from("forecast-images").remove([forecast.image_path]);
    if (storageError) {
      setError("Forecast was deleted, but its image could not be removed: " + storageError.message);
    }

    setMessage("Forecast deleted.");
    await loadData();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const executionPrice = Number(form.executionPrice);
    const stopLoss = Number(form.stopLoss);
    const takeProfit1 = Number(form.takeProfit1);
    const takeProfit2 = form.takeProfit2 ? Number(form.takeProfit2) : null;

    if (
      !form.instrumentId ||
      !Number.isFinite(executionPrice) ||
      executionPrice <= 0 ||
      !Number.isFinite(stopLoss) ||
      stopLoss <= 0 ||
      !Number.isFinite(takeProfit1) ||
      takeProfit1 <= 0 ||
      (takeProfit2 !== null && (!Number.isFinite(takeProfit2) || takeProfit2 <= 0))
    ) {
      setError("Choose an instrument and enter valid execution, stop-loss, and take-profit prices.");
      return;
    }

    if (!editingForecast && !imageFile) {
      setError("Upload a TradingView screenshot before publishing.");
      return;
    }

    setIsSaving(true);

    let imagePath = editingForecast?.image_path ?? "";
    let replacementPath: string | null = null;

    try {
      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Your admin session has ended. Please sign in again.");
        }

        replacementPath = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("forecast-images").upload(replacementPath, imageFile, {
          cacheControl: "31536000",
          contentType: "image/jpeg",
          upsert: false,
        });

        if (uploadError) {
          throw uploadError;
        }

        imagePath = replacementPath;
      }

      const payload = {
        instrument_id: form.instrumentId,
        direction: form.direction,
        execution_price: executionPrice,
        stop_loss: stopLoss,
        take_profit_1: takeProfit1,
        take_profit_2: takeProfit2,
        status: form.status,
        trade_date: form.tradeDate,
        notes: form.notes.trim(),
        image_path: imagePath,
        ai_extraction: extraction,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = editingForecast
        ? await supabase.from("trading_forecasts").update(payload).eq("id", editingForecast.id)
        : await supabase.from("trading_forecasts").insert(payload);

      if (saveError) {
        throw saveError;
      }

      if (replacementPath && editingForecast?.image_path) {
        await supabase.storage.from("forecast-images").remove([editingForecast.image_path]);
      }

      setMessage(editingForecast ? "Forecast updated for every website visitor." : "Forecast published for every website visitor.");
      resetForm();
      await loadData();
    } catch (saveError) {
      if (replacementPath) {
        await supabase.storage.from("forecast-images").remove([replacementPath]);
      }
      setError(saveError instanceof Error ? saveError.message : "Unable to publish this forecast.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHero
        title="AI Trade Forecast Admin"
        subtitle="Upload a TradingView screenshot, let AI prefill the trade values, then confirm and publish."
        imageSrc={heroImage}
        imageAlt="Forecast dashboard with candlestick charts"
      />

      <div className="container py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>{editingForecast ? "Edit published forecast" : "Publish a trade forecast"}</CardTitle>
                <CardDescription>
                  Covered markets: Forex, Indices, Commodities, and Crypto. Images are compressed to 450 KB or less before upload.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="forecast-image">TradingView image</label>
                    <Input
                      id="forecast-image"
                      type="file"
                      accept="image/*"
                      onChange={(event) => void handleImageChange(event.target.files?.[0])}
                    />
                    <p className="text-xs text-muted-foreground">The image is converted to compressed JPEG before it is saved.</p>
                  </div>

                  <Button type="button" variant="secondary" onClick={() => void handleReadImage()} disabled={!imageFile || isReadingImage}>
                    {isReadingImage ? "Reading image…" : "Read trade values with AI"}
                  </Button>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="instrument">Instrument</label>
                      <select id="instrument" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.instrumentId} onChange={(event) => setField("instrumentId", event.target.value)}>
                        <option value="">Choose instrument</option>
                        {instruments.map((instrument) => (
                          <option key={instrument.id} value={instrument.id}>{instrument.market} — {instrument.symbol}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="direction">Direction</label>
                      <select id="direction" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.direction} onChange={(event) => setField("direction", event.target.value as "long" | "short")}>
                        <option value="long">Long / Buy</option>
                        <option value="short">Short / Sell</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="execution-price">Execution price</label>
                      <Input id="execution-price" inputMode="decimal" value={form.executionPrice} onChange={(event) => setField("executionPrice", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="stop-loss">Stop loss</label>
                      <Input id="stop-loss" inputMode="decimal" value={form.stopLoss} onChange={(event) => setField("stopLoss", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="take-profit-1">Take profit 1</label>
                      <Input id="take-profit-1" inputMode="decimal" value={form.takeProfit1} onChange={(event) => setField("takeProfit1", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="take-profit-2">Take profit 2 (optional)</label>
                      <Input id="take-profit-2" inputMode="decimal" value={form.takeProfit2} onChange={(event) => setField("takeProfit2", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="trade-date">Trade date</label>
                      <Input id="trade-date" type="date" value={form.tradeDate} onChange={(event) => setField("tradeDate", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="status">Result status</label>
                      <select id="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => setField("status", event.target.value as TradeStatus)}>
                        <option value="active">Active</option>
                        <option value="win">Win</option>
                        <option value="loss">Loss</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="notes">Trade notes</label>
                    <Textarea id="notes" rows={4} maxLength={2000} value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Optional context visible in the setup." />
                  </div>

                  {selectedInstrument ? <p className="text-sm text-muted-foreground">Publishing for {selectedInstrument.market} — {selectedInstrument.symbol}.</p> : null}
                  {extraction ? <p className="text-sm text-muted-foreground">AI confidence: {extraction.confidence}. Always check every field against the image.</p> : null}
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="rounded-full px-6" disabled={isSaving}>{isSaving ? "Publishing…" : editingForecast ? "Update forecast" : "Publish forecast"}</Button>
                    {editingForecast ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel editing</Button> : null}
                  </div>
                </form>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Compressed preview</CardTitle>
                <CardDescription>Only this compressed image is stored in Supabase.</CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? <img src={previewUrl} alt="Trade screenshot preview" className="h-72 w-full rounded-xl object-cover" /> : <div className="flex h-72 items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm text-muted-foreground">Upload a TradingView screenshot to prepare it for AI and storage.</div>}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal delayMs={180}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Published forecasts</CardTitle>
              <CardDescription>These records are shared with every visitor and no longer depend on your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {forecasts.length ? forecasts.map((forecast) => {
                const instrument = instruments.find((item) => item.id === forecast.instrument_id);
                return <div key={forecast.id} className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                  <div><p className="font-semibold">{instrument?.market ?? "Unknown"} — {instrument?.symbol ?? "Unknown"}</p><p className="text-sm text-muted-foreground">{forecast.direction.toUpperCase()} · {forecast.status.toUpperCase()} · {forecast.trade_date}</p></div>
                  <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => handleEdit(forecast)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => void handleDelete(forecast)}>Delete</Button></div>
                </div>;
              }) : <p className="text-sm text-muted-foreground">No forecasts have been published yet.</p>}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};

export default DailyForecastAdmin;
