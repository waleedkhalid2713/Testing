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
    return jsonResponse({ error: "Only the admin can analyse forecast images." }, 403);
  }

  const { image, mode, trade } = await request.json().catch(() => ({ image: "", mode: "setup", trade: null }));
  const isResultCheck = mode === "result";

  if (
    typeof image !== "string" ||
    !image.startsWith("data:image/jpeg;base64,") ||
    image.length > 700_000
  ) {
    return jsonResponse({ error: "Upload a compressed JPEG image under 500 KB." }, 400);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "AI is not configured yet. Add GEMINI_API_KEY to this Edge Function's secrets." },
      503,
    );
  }

  const instructions = isResultCheck
    ? [
        "Review this TradingView result screenshot as evidence for an already published trade.",
        "Trade values: " + JSON.stringify(trade ?? {}),
        "Suggest win only if the screenshot clearly shows take profit reached, a profitable close, or a completed positive result.",
        "Suggest loss only if it clearly shows stop loss reached, a losing close, or a completed negative result.",
        "Suggest active if it is still open. Use unclear if the image does not prove the result.",
        "Do not invent a result or make a trading recommendation.",
        "Return only valid JSON with:",
        "{",
        '  "suggestion": "win | loss | active | unclear",',
        '  "notes": "short factual explanation of the visible evidence",',
        '  "confidence": "high | medium | low"',
        "}",
      ].join("\n")
    : [
        "Analyse this TradingView trade screenshot as an ICT (Inner Circle Trader) chart reader.",
        "First read all numerical labels from the position tool, price scale, and order labels before analysing the chart.",
        "For a short / sell position tool: execution is the entry line, stop loss is the upper risk boundary or stop label, and take profit is the lower target boundary or target label.",
        "For a long / buy position tool: execution is the entry line, stop loss is the lower risk boundary or stop label, and take profit is the upper target boundary or target label.",
        "Return stopLoss whenever its number is visibly readable. Use null only when no stop-loss number can be read clearly; never invent a price.",
        "Identify only ICT concepts visible in the screenshot: buy-side or sell-side liquidity, liquidity sweep, displacement, market-structure shift, fair value gap, order block, premium/discount, and likely target liquidity.",
        "Do not create a trade recommendation, guarantee an outcome, or claim an ICT concept is present when it cannot be seen.",
        "Return only valid JSON with:",
        "{",
        '  "market": "Forex | Indices | Commodities | Crypto | null",',
        '  "symbol": "string or null",',
        '  "direction": "long | short | null",',
        '  "executionPrice": number or null,',
        '  "stopLoss": number or null,',
        '  "takeProfit1": number or null,',
        '  "takeProfit2": number or null,',
        '  "status": "active | win | loss",',
        '  "notes": "2-4 factual sentences: timeframe, visible setup, visible ICT concepts, and target/risk context. State uncertainty where needed.",',
        '  "confidence": "high | medium | low"',
        "}",
        "Use win or loss only if the screenshot explicitly proves the completed outcome. Otherwise use active.",
      ].join("\n");

  const imageBase64 = image.slice("data:image/jpeg;base64,".length);
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
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
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
    return jsonResponse({ error: "The free AI service could not analyse this image. Please try again later." }, 502);
  }

  const geminiData = await geminiResponse.json();
  const text = geminiData.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return jsonResponse({ error: "The AI returned no readable trade details." }, 422);
  }

  try {
    const parsed = JSON.parse(text.replace(/^\`\`\`json\s*|\s*\`\`\`$/g, ""));
    return isResultCheck ? jsonResponse({ result: parsed }) : jsonResponse({ extraction: parsed });
  } catch {
    return jsonResponse({ error: "The AI response was not in the expected format." }, 422);
  }
});
