import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "epictrader.support@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fetchWithRetry = async (url: string, options: RequestInit) => {
  let response: Response | null = null;

  for (const delayMs of [0, 2_000, 5_000, 10_000]) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    response = await fetch(url, options);
    if (response.status !== 429 && response.status !== 503) {
      return response;
    }
  }

  return response!;
};

type TradeExtraction = {
  market: string | null;
  symbol: string | null;
  direction: "long" | "short" | null;
  executionPrice: number | null;
  stopLoss: number | null;
  takeProfit1: number | null;
  takeProfit2: number | null;
  status: "active" | "win" | "loss";
  notes: string;
  confidence: "high" | "medium" | "low";
};

const nullableNumber = (value: unknown) =>
  value === null || (typeof value === "number" && Number.isFinite(value) && value > 0);

const isTradeExtraction = (value: unknown): value is TradeExtraction => {
  if (!value || typeof value !== "object") return false;

  const extraction = value as Record<string, unknown>;
  return (
    (extraction.market === null || typeof extraction.market === "string") &&
    (extraction.symbol === null || typeof extraction.symbol === "string") &&
    (extraction.direction === null || extraction.direction === "long" || extraction.direction === "short") &&
    nullableNumber(extraction.executionPrice) &&
    nullableNumber(extraction.stopLoss) &&
    nullableNumber(extraction.takeProfit1) &&
    nullableNumber(extraction.takeProfit2) &&
    (extraction.status === "active" || extraction.status === "win" || extraction.status === "loss") &&
    typeof extraction.notes === "string" &&
    extraction.notes.length <= 2_000 &&
    (extraction.confidence === "high" || extraction.confidence === "medium" || extraction.confidence === "low")
  );
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse({ error: "You must sign in as admin." }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authorization } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonResponse({ error: "Only the admin can use forecast AI." }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const mode = body.mode === "notes" ? "notes" : "image";
  const image = body.image;
  if (mode === "image" && (typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,") || image.length > 700_000)) {
    return jsonResponse({ error: "Upload a compressed JPEG image under 500 KB." }, 400);
  }
  if (image !== undefined && (typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,") || image.length > 700_000)) {
    return jsonResponse({ error: "Chart evidence must be a compressed JPEG under 500 KB." }, 400);
  }
  if (mode === "notes" && (!body.trade || typeof body.trade.symbol !== "string")) {
    return jsonResponse({ error: "Valid structured trade details are required." }, 400);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "AI is not configured yet. Add GEMINI_API_KEY to this Edge Function's secrets." },
      503,
    );
  }

  const instructions = mode === "notes" ? [
    "Draft concise, factual educational trade notes from the structured data below.",
    "Do not give financial advice, guarantee outcomes, or invent chart observations or drawings.",
    image ? "A chart screenshot is attached; mention only evidence actually visible in it." : "No chart image is attached. Never claim to have analysed a chart or its drawings.",
    body.trade?.result ? "Write editable post-trade result notes using the supplied outcome." : "Write editable pre-trade forecast notes including setup, risk, targets, and administrator rationale.",
    "Return only JSON as {\"notes\": \"2-5 concise sentences\"}.",
    `Structured trade data: ${JSON.stringify(body.trade).slice(0, 8000)}`,
  ].join("\n") : [
    "Analyse this TradingView trade screenshot as an ICT (Inner Circle Trader) chart reader.",
    "First read all numerical labels from the position tool, price scale, and order labels before analysing the chart.",
    "For a short / sell position tool: execution is the entry line, stop loss is the upper risk boundary or stop label, and take profit is the lower target boundary or target label.",
    "For a long / buy position tool: execution is the entry line, stop loss is the lower risk boundary or stop label, and take profit is the upper target boundary or target label.",
    "Return stopLoss whenever its number is visibly readable. Use null only when no stop-loss number can be read clearly; never invent a price.",
    "Identify only concepts visible in the screenshot; do not create a recommendation or claim a concept is present when it cannot be seen.",
    "Return only valid JSON with:",
    '{"market":"Forex | Indices | Commodities | Crypto | null","symbol":"string or null","direction":"long | short | null","executionPrice":number|null,"stopLoss":number|null,"takeProfit1":number|null,"takeProfit2":number|null,"status":"active | win | loss","notes":"2-4 factual sentences","confidence":"high | medium | low"}',
    "Use win or loss only if the screenshot proves the outcome. Otherwise use active.",
  ].join("\n");

  const imageBase64 = typeof image === "string" ? image.slice("data:image/jpeg;base64,".length) : null;
  const model = "gemini-3.6-flash";
  const geminiResponse = await fetchWithRetry(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) +
      ":generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: instructions },
            ...(imageBase64 ? [{ inline_data: { mime_type: "image/jpeg", data: imageBase64 } }] : []),
          ],
        }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    const details = await geminiResponse.text();
    console.error("Gemini image analysis failed:", details);
    return jsonResponse({ error: mode === "notes" ? "The AI service could not draft notes. You can continue manually." : "The AI service could not analyse this image. Please try again later." }, 502);
  }

  const geminiData = await geminiResponse.json();
  const text = geminiData.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return jsonResponse({ error: mode === "notes" ? "The AI returned no notes." : "The AI returned no readable trade details." }, 422);
  }

  try {
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    if (mode === "notes") {
      if (typeof parsed.notes !== "string" || !parsed.notes.trim()) return jsonResponse({ error: "AI returned no notes." }, 422);
      return jsonResponse({ notes: parsed.notes.trim() });
    }
    return jsonResponse({ extraction: parsed });
  } catch {
    return jsonResponse({ error: "The AI response was not in the expected format." }, 422);
  }
});
