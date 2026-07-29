import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { TradingViewChart } from "@/components/forecast/TradingViewChart";
import heroImage from "@/assets/module-forecast-daily.jpg";
import { compressForecastImage, fileToDataUrl } from "@/lib/compressForecastImage";
import { calculateTradeMetrics, getTradeWarnings, validateForecastDraft, type TradeDirection } from "@/lib/tradeForecast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Instrument = Tables<"trading_instruments">;
type Forecast = Tables<"trading_forecasts">;
type SourceType = "screenshot" | "live_chart";
type TradeStatus = "active" | "win" | "loss";
type Extraction = { market: string | null; symbol: string | null; direction: TradeDirection | null; executionPrice: number | null; stopLoss: number | null; takeProfit1: number | null; takeProfit2: number | null; status: TradeStatus; notes: string; confidence: "high" | "medium" | "low" };
type FormState = { instrumentId: string; sourceType: SourceType; exchange: string; timeframe: string; direction: TradeDirection; executionPrice: string; stopLoss: string; takeProfit1: string; takeProfit2: string; takeProfit3: string; expectedPnl: string; status: TradeStatus; tradeDate: string; rationale: string; notes: string; resultPnl: string; resultPnlPercent: string; resultNotes: string };
const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = (): FormState => ({ instrumentId: "", sourceType: "screenshot", exchange: "OANDA", timeframe: "60", direction: "long", executionPrice: "", stopLoss: "", takeProfit1: "", takeProfit2: "", takeProfit3: "", expectedPnl: "", status: "active", tradeDate: today(), rationale: "", notes: "", resultPnl: "", resultPnlPercent: "", resultNotes: "" });
const numberOrNull = (value: string) => value.trim() ? Number(value) : null;
const normaliseSymbol = (symbol: string) => symbol.replace(/[^a-z0-9]/gi, "").toLowerCase();
const evidenceUrl = (path: string | null) => path ? supabase.storage.from("forecast-images").getPublicUrl(path).data.publicUrl : null;

export default function DailyForecastAdmin() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Forecast | null>(null);
  const [preFile, setPreFile] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [prePreview, setPrePreview] = useState<string | null>(null);
  const [postPreview, setPostPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "save" | "image-ai" | "notes-ai">("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [listStatus, setListStatus] = useState("");
  const [listSource, setListSource] = useState("");
  const [listQuery, setListQuery] = useState("");
  const selectedInstrument = instruments.find((item) => item.id === form.instrumentId);
  const prices = { entry: Number(form.executionPrice), stop: Number(form.stopLoss), target: Number(form.takeProfit1) };
  const metrics = calculateTradeMetrics(prices.entry, prices.stop, prices.target);
  const targets = [form.takeProfit1, form.takeProfit2, form.takeProfit3].filter(Boolean).map(Number);
  const warnings = getTradeWarnings(form.direction, prices.entry, prices.stop, targets);
  const marketGroups = useMemo(() => [...new Set(instruments.map((item) => `${item.market_type} · ${item.sub_market}`))], [instruments]);
  const filteredForecasts = useMemo(() => forecasts.filter((forecast) => {
    const instrument = instruments.find((item) => item.id === forecast.instrument_id);
    const query = listQuery.trim().toLowerCase();
    return (!listStatus || forecast.status === listStatus)
      && (!listSource || forecast.source_type === listSource)
      && (!query || `${instrument?.symbol ?? ""} ${instrument?.name ?? ""}`.toLowerCase().includes(query));
  }), [forecasts, instruments, listQuery, listSource, listStatus]);

  const loadData = async () => {
    const [instrumentResult, forecastResult] = await Promise.all([
      supabase.from("trading_instruments").select("*").eq("is_active", true).order("display_order"),
      supabase.from("trading_forecasts").select("*").order("published_at", { ascending: false }),
    ]);
    if (instrumentResult.error || forecastResult.error) setError("Unable to load forecasts. Apply the latest Supabase migrations and try again.");
    else { setInstruments(instrumentResult.data ?? []); setForecasts(forecastResult.data ?? []); }
  };
  useEffect(() => { void loadData(); }, []);
  useEffect(() => () => { if (prePreview?.startsWith("blob:")) URL.revokeObjectURL(prePreview); if (postPreview?.startsWith("blob:")) URL.revokeObjectURL(postPreview); }, [prePreview, postPreview]);
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const prepareImage = async (file: File | undefined, kind: "pre" | "post") => {
    if (!file) return;
    setError("");
    try {
      const compressed = await compressForecastImage(file);
      const url = URL.createObjectURL(compressed);
      if (kind === "pre") { setPreFile(compressed); setPrePreview(url); setExtraction(null); }
      else { setPostFile(compressed); setPostPreview(url); }
      setMessage(`${kind === "pre" ? "Pre-trade" : "Post-trade"} evidence prepared (${Math.ceil(compressed.size / 1024)} KB).`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to prepare this image."); }
  };
  const readScreenshot = async () => {
    if (!preFile) return setError("Attach pre-trade evidence before asking AI to read it.");
    setBusy("image-ai"); setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-trade-image", { body: { mode: "image", image: await fileToDataUrl(preFile) } });
      if (fnError || data?.error || !data?.extraction) throw new Error(data?.error ?? fnError?.message ?? "AI returned no trade details.");
      const next = data.extraction as Extraction;
      const match = instruments.find((item) => next.symbol && normaliseSymbol(item.symbol) === normaliseSymbol(next.symbol));
      setExtraction(next);
      setForm((current) => ({ ...current, instrumentId: match?.id ?? current.instrumentId, direction: next.direction ?? current.direction, executionPrice: next.executionPrice?.toString() ?? current.executionPrice, stopLoss: next.stopLoss?.toString() ?? current.stopLoss, takeProfit1: next.takeProfit1?.toString() ?? current.takeProfit1, takeProfit2: next.takeProfit2?.toString() ?? current.takeProfit2, status: next.status, notes: next.notes || current.notes }));
      setMessage(`AI filled visible screenshot values (${next.confidence} confidence). Review every field.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "AI could not read the evidence. You can continue manually."); } finally { setBusy(""); }
  };
  const generateNotes = async (result = false) => {
    if (!selectedInstrument || !metrics) return setError("Choose an instrument and enter valid prices before generating notes.");
    setBusy("notes-ai"); setError("");
    try {
      const evidenceFile = result ? postFile : preFile;
      const image = evidenceFile ? await fileToDataUrl(evidenceFile) : undefined;
      const { data, error: fnError } = await supabase.functions.invoke("analyze-trade-image", { body: { mode: "notes", image, trade: { symbol: selectedInstrument.symbol, exchange: form.exchange, timeframe: form.timeframe, direction: form.direction, entry: prices.entry, stopLoss: prices.stop, takeProfits: targets, riskReward: metrics.riskRewardRatio, expectedReturnPercent: metrics.rewardPercent, expectedPnl: numberOrNull(form.expectedPnl), rationale: form.rationale, result: result ? { status: form.status, pnl: numberOrNull(form.resultPnl), pnlPercent: numberOrNull(form.resultPnlPercent), notes: form.resultNotes } : null } } });
      if (fnError || data?.error || typeof data?.notes !== "string") throw new Error(data?.error ?? fnError?.message ?? "AI returned no notes.");
      setField(result ? "resultNotes" : "notes", data.notes);
      setMessage("AI draft generated. Review and edit it before saving.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "AI failed. You can still write notes manually."); } finally { setBusy(""); }
  };
  const reset = () => { setForm(emptyForm()); setEditing(null); setPreFile(null); setPostFile(null); setPrePreview(null); setPostPreview(null); setExtraction(null); setError(""); };
  const editForecast = (forecast: Forecast) => {
    setEditing(forecast); setForm({ instrumentId: forecast.instrument_id, sourceType: forecast.source_type as SourceType, exchange: forecast.exchange, timeframe: forecast.timeframe, direction: forecast.direction as TradeDirection, executionPrice: String(forecast.execution_price), stopLoss: String(forecast.stop_loss), takeProfit1: String(forecast.take_profit_1), takeProfit2: forecast.take_profit_2?.toString() ?? "", takeProfit3: forecast.take_profit_3?.toString() ?? "", expectedPnl: forecast.expected_pnl?.toString() ?? "", status: forecast.status as TradeStatus, tradeDate: forecast.trade_date, rationale: forecast.rationale, notes: forecast.notes, resultPnl: forecast.result_pnl?.toString() ?? "", resultPnlPercent: forecast.result_pnl_percent?.toString() ?? "", resultNotes: forecast.result_notes });
    setPrePreview(evidenceUrl(forecast.image_path)); setPostPreview(evidenceUrl(forecast.result_image_path)); setPreFile(null); setPostFile(null); setExtraction(forecast.ai_extraction as Extraction | null); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const upload = async (file: File, folder: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Your admin session ended. Sign in again.");
    const path = `${user.id}/${folder}${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("forecast-images").upload(path, file, { cacheControl: "31536000", contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
    return path;
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!form.instrumentId) return setError("Choose a trading instrument.");
    const validationErrors = validateForecastDraft({
      direction: form.direction,
      entry: prices.entry,
      stop: prices.stop,
      targets: [numberOrNull(form.takeProfit1), numberOrNull(form.takeProfit2), numberOrNull(form.takeProfit3)],
      sourceType: form.sourceType,
      exchange: form.exchange,
      timeframe: form.timeframe,
      hasPreTradeEvidence: Boolean(preFile || editing?.image_path),
      expectedPnl: numberOrNull(form.expectedPnl),
      resultPnl: numberOrNull(form.resultPnl),
      resultPnlPercent: numberOrNull(form.resultPnlPercent),
    });
    if (validationErrors.length) return setError(validationErrors.join(" "));
    setBusy("save"); const uploaded: string[] = [];
    try {
      const imagePath = preFile ? await upload(preFile, "pre-trade/") : editing?.image_path ?? null; if (preFile && imagePath) uploaded.push(imagePath);
      const resultPath = postFile ? await upload(postFile, "post-trade/") : editing?.result_image_path ?? null; if (postFile && resultPath) uploaded.push(resultPath);
      const payload = { instrument_id: form.instrumentId, source_type: form.sourceType, exchange: form.exchange.trim(), timeframe: form.timeframe, direction: form.direction, execution_price: prices.entry, stop_loss: prices.stop, take_profit_1: prices.target, take_profit_2: numberOrNull(form.takeProfit2), take_profit_3: numberOrNull(form.takeProfit3), expected_pnl: numberOrNull(form.expectedPnl), status: form.status, trade_date: form.tradeDate, rationale: form.rationale.trim(), notes: form.notes.trim(), result_pnl: numberOrNull(form.resultPnl), result_pnl_percent: numberOrNull(form.resultPnlPercent), result_notes: form.resultNotes.trim(), image_path: imagePath, result_image_path: resultPath, ai_extraction: extraction, chart_metadata: form.sourceType === "live_chart" ? { provider: "TradingView Advanced Chart widget", symbol: selectedInstrument?.symbol, exchange: form.exchange, timeframe: form.timeframe, capturedAt: new Date().toISOString(), containsDrawings: false } : null, updated_at: new Date().toISOString() };
      const result = editing ? await supabase.from("trading_forecasts").update(payload).eq("id", editing.id) : await supabase.from("trading_forecasts").insert(payload);
      if (result.error) throw result.error;
      const replaced = [preFile && editing?.image_path, postFile && editing?.result_image_path].filter((path): path is string => Boolean(path)); if (replaced.length) await supabase.storage.from("forecast-images").remove(replaced);
      reset(); setMessage(editing ? "Forecast updated." : "Forecast published."); await loadData();
    } catch (cause) { if (uploaded.length) await supabase.storage.from("forecast-images").remove(uploaded); setError(cause instanceof Error ? cause.message : "Unable to save forecast."); } finally { setBusy(""); }
  };
  const remove = async (forecast: Forecast) => {
    if (!window.confirm("Delete this forecast and its evidence?")) return;
    const { error: deleteError } = await supabase.from("trading_forecasts").delete().eq("id", forecast.id); if (deleteError) return setError(deleteError.message);
    const paths = [forecast.image_path, forecast.result_image_path].filter((path): path is string => Boolean(path)); if (paths.length) await supabase.storage.from("forecast-images").remove(paths); await loadData(); setMessage("Forecast deleted.");
  };
  const metric = (value: number | null | undefined, suffix = "") => value == null ? "—" : `${value.toFixed(2)}${suffix}`;

  return <div><PageHero title="Trade Forecast Admin" subtitle="Publish screenshot-based forecasts or build a setup alongside a live TradingView chart." imageSrc={heroImage} imageAlt="Forecast dashboard with candlestick charts" />
    <div className="container space-y-8 py-12"><Card><CardHeader><CardTitle>{editing ? "Edit forecast" : "Create forecast"}</CardTitle><CardDescription>Both workflows use the same validated trade model, evidence storage, and public forecast display.</CardDescription></CardHeader><CardContent>
      <form className="space-y-6" onSubmit={save}>
        <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-medium">Forecast source</legend>{(["screenshot", "live_chart"] as SourceType[]).map((source) => <label key={source} className={`cursor-pointer rounded-xl border p-4 ${form.sourceType === source ? "border-primary bg-primary/5" : ""}`}><input className="mr-2" type="radio" name="source" checked={form.sourceType === source} onChange={() => setField("sourceType", source)} />{source === "screenshot" ? "Upload Screenshot" : "Use Live TradingView Chart"}<span className="mt-1 block text-xs text-muted-foreground">{source === "screenshot" ? "Existing AI-assisted workflow." : "Official embedded chart with saved configuration metadata."}</span></label>)}</fieldset>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="space-y-2 text-sm font-medium">Trading pair<select className="h-10 w-full rounded-md border bg-background px-3" value={form.instrumentId} onChange={(e) => setField("instrumentId", e.target.value)}><option value="">Choose instrument</option>{marketGroups.map((group) => <optgroup key={group} label={group}>{instruments.filter((item) => `${item.market_type} · ${item.sub_market}` === group).map((item) => <option key={item.id} value={item.id}>{item.symbol} — {item.name}</option>)}</optgroup>)}</select></label><label className="space-y-2 text-sm font-medium">Exchange<Input value={form.exchange} maxLength={80} onChange={(e) => setField("exchange", e.target.value)} placeholder="OANDA" /></label><label className="space-y-2 text-sm font-medium">Timeframe<select className="h-10 w-full rounded-md border bg-background px-3" value={form.timeframe} onChange={(e) => setField("timeframe", e.target.value)}>{[["1","1 minute"],["5","5 minutes"],["15","15 minutes"],["60","1 hour"],["240","4 hours"],["D","Daily"],["W","Weekly"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Trade date<Input type="date" value={form.tradeDate} onChange={(e) => setField("tradeDate", e.target.value)} /></label></div>
        {form.sourceType === "live_chart" ? <TradingViewChart exchange={form.exchange} symbol={selectedInstrument?.symbol ?? ""} timeframe={form.timeframe} /> : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="space-y-2 text-sm font-medium">Direction<select className="h-10 w-full rounded-md border bg-background px-3" value={form.direction} onChange={(e) => setField("direction", e.target.value as TradeDirection)}><option value="long">Long / Buy</option><option value="short">Short / Sell</option></select></label>{([['executionPrice','Entry price'],['stopLoss','Stop loss'],['takeProfit1','Take profit 1'],['takeProfit2','Take profit 2 (optional)'],['takeProfit3','Take profit 3 (optional)'],['expectedPnl','Expected P&L (optional)']] as [keyof FormState,string][]).map(([key,label]) => <label key={key} className="space-y-2 text-sm font-medium">{label}<Input inputMode="decimal" value={form[key]} onChange={(e) => setField(key, e.target.value as never)} /></label>)}</div>
        <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-5"><div><p className="text-xs text-muted-foreground">Expected risk</p><p className="font-semibold">{metric(metrics?.risk)}</p></div><div><p className="text-xs text-muted-foreground">Expected reward</p><p className="font-semibold">{metric(metrics?.reward)}</p></div><div><p className="text-xs text-muted-foreground">Risk distance</p><p className="font-semibold">{metric(metrics?.riskPercent, "%")}</p></div><div><p className="text-xs text-muted-foreground">Expected return</p><p className="font-semibold">{metric(metrics?.rewardPercent, "%")}</p></div><div><p className="text-xs text-muted-foreground">Risk / reward</p><p className="font-semibold">{metrics?.riskRewardRatio ? `1 : ${metrics.riskRewardRatio.toFixed(2)}` : "—"}</p></div></div>
        {warnings.length ? <Alert><AlertTitle>Review this setup</AlertTitle><AlertDescription><ul className="list-disc pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></AlertDescription></Alert> : null}
        <div className="grid gap-4 lg:grid-cols-2"><label className="space-y-2 text-sm font-medium">Forecast rationale<Textarea rows={5} maxLength={3000} value={form.rationale} onChange={(e) => setField("rationale", e.target.value)} placeholder="Administrator's factual reasoning and setup context" /></label><div className="space-y-2"><label className="text-sm font-medium">Editable forecast notes</label><Textarea rows={5} maxLength={2000} value={form.notes} onChange={(e) => setField("notes", e.target.value)} /><Button type="button" variant="secondary" disabled={busy !== ""} onClick={() => void generateNotes()}>{busy === "notes-ai" ? "Generating…" : "Generate notes with AI"}</Button></div></div>
        <Card><CardHeader><CardTitle className="text-lg">Pre-trade evidence</CardTitle><CardDescription>{form.sourceType === "live_chart" ? "The free embedded widget does not expose drawings or screenshots. Upload an image to preserve visual evidence; chart configuration is saved separately." : "Required for screenshot forecasts and available to the existing Gemini image reader."}</CardDescription></CardHeader><CardContent className="space-y-3"><Input type="file" accept="image/*" onChange={(e) => void prepareImage(e.target.files?.[0], "pre")} />{prePreview ? <img src={prePreview} alt="Pre-trade evidence preview" className="max-h-72 w-full rounded-xl object-contain" /> : <p className="text-sm text-muted-foreground">No pre-trade evidence attached.</p>}{form.sourceType === "screenshot" ? <Button type="button" variant="secondary" disabled={!preFile || busy !== ""} onClick={() => void readScreenshot()}>{busy === "image-ai" ? "Reading…" : "Read trade values with AI"}</Button> : null}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Post-trade result</CardTitle><CardDescription>Complete this section when the trade finishes. Evidence and notes remain separate from the original setup.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><label className="space-y-2 text-sm font-medium">Status<select className="h-10 w-full rounded-md border bg-background px-3" value={form.status} onChange={(e) => setField("status", e.target.value as TradeStatus)}><option value="active">Active</option><option value="win">Win</option><option value="loss">Loss</option></select></label><label className="space-y-2 text-sm font-medium">Result P&L<Input inputMode="decimal" value={form.resultPnl} onChange={(e) => setField("resultPnl", e.target.value)} /></label><label className="space-y-2 text-sm font-medium">Result P&L %<Input inputMode="decimal" value={form.resultPnlPercent} onChange={(e) => setField("resultPnlPercent", e.target.value)} /></label></div><Textarea aria-label="Result notes" rows={4} maxLength={3000} value={form.resultNotes} onChange={(e) => setField("resultNotes", e.target.value)} placeholder="Editable result notes" /><div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" disabled={busy !== "" || form.status === "active"} onClick={() => void generateNotes(true)}>Generate result notes</Button><Input className="max-w-md" type="file" accept="image/*" onChange={(e) => void prepareImage(e.target.files?.[0], "post")} /></div>{postPreview ? <img src={postPreview} alt="Post-trade evidence preview" className="max-h-64 w-full rounded-xl object-contain" /> : null}</CardContent></Card>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}{message ? <p className="text-sm text-emerald-600">{message}</p> : null}<div className="flex gap-3"><Button type="submit" disabled={busy !== ""}>{busy === "save" ? "Saving…" : editing ? "Update forecast" : "Save forecast"}</Button>{editing ? <Button type="button" variant="outline" onClick={reset}>Cancel</Button> : null}</div>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>Published forecasts</CardTitle><CardDescription>Edit, complete, or remove existing screenshot and live-chart forecasts.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-4"><Input aria-label="Search forecasts" value={listQuery} onChange={(event) => setListQuery(event.target.value)} placeholder="Search symbol or instrument" /><select aria-label="Filter by source" className="h-10 rounded-md border bg-background px-3 text-sm" value={listSource} onChange={(event) => setListSource(event.target.value)}><option value="">All sources</option><option value="screenshot">Screenshot</option><option value="live_chart">Live chart</option></select><select aria-label="Filter by status" className="h-10 rounded-md border bg-background px-3 text-sm" value={listStatus} onChange={(event) => setListStatus(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="win">Win</option><option value="loss">Loss</option></select><Button type="button" variant="outline" onClick={() => { setListQuery(""); setListSource(""); setListStatus(""); }}>Clear filters</Button></div>{filteredForecasts.length ? filteredForecasts.map((forecast) => { const instrument = instruments.find((item) => item.id === forecast.instrument_id); return <div key={forecast.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{instrument?.symbol ?? "Unknown instrument"}</p><Badge variant="outline">{forecast.source_type === "live_chart" ? "Live chart" : "Screenshot"}</Badge><Badge>{forecast.status}</Badge></div><p className="text-sm text-muted-foreground">{forecast.direction.toUpperCase()} · {forecast.timeframe || "Legacy timeframe"} · {forecast.trade_date}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => editForecast(forecast)}>Edit</Button><Button type="button" size="sm" variant="destructive" onClick={() => void remove(forecast)}>Delete</Button></div></div>; }) : <p className="text-sm text-muted-foreground">{forecasts.length ? "No forecasts match these filters." : "No forecasts published."}</p>}</CardContent></Card>
    </div></div>;
}
