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

  const { image } = await request.json().catch(() => ({ image: "" }));
  if (
    typeof image !== "string" ||
    !image.startsWith("data:image/jpeg;base64,") ||
    image.length > 700_000
  ) {
    return jsonResponse({ error: "Upload a compressed JPEG image under 500 KB." }, 400);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "AI is not configured yet. Add OPENAI_API_KEY to this Edge Function's secrets." },
      503,
    );
  }

  const instructions = `Read this TradingView trade screenshot. Extract only values clearly visible in the image; never invent a price, direction, symbol, or result. Return only valid JSON with:
{
  "market": "Forex | Indices | Commodities | Crypto | null",
  "symbol": "string or null",
  "direction": "long | short | null",
  "executionPrice": number or null,
  "stopLoss": number or null,
  "takeProfit1": number or null,
  "takeProfit2": number or null,
  "status": "active | win | loss",
  "notes": "short factual description of what was visible",
  "confidence": "high | medium | low"
}
Use win or loss only if the screenshot explicitly proves the completed outcome. Otherwise use active.`;

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_VISION_MODEL") ?? "gpt-4o-mini",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: instructions },
          { type: "input_image", image_url: image, detail: "low" },
        ],
      }],
      max_output_tokens: 400,
    }),
  });

  if (!openAiResponse.ok) {
    const details = await openAiResponse.text();
    console.error("OpenAI image analysis failed:", details);
    return jsonResponse({ error: "The AI service could not analyse this image." }, 502);
  }

  const openAiData = await openAiResponse.json();
  const text = openAiData.output_text?.trim();
  if (!text) {
    return jsonResponse({ error: "The AI returned no readable trade details." }, 422);
  }

  try {
    const extraction = JSON.parse(text.replace(/^\`\`\`json\s*|\s*\`\`\`$/g, ""));
    return jsonResponse({ extraction });
  } catch {
    return jsonResponse({ error: "The AI response was not in the expected format." }, 422);
  }
});
