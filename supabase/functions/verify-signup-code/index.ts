import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  email: z.string().trim().email().max(255),
  code: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(60),
  age: z.string().trim().min(1).max(20),
  profession: z.string().trim().min(1).max(80),
});

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Not found", { status: 404, headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not configured");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Please check your details and try again." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = parsed.data.email.toLowerCase();
    const code = parsed.data.code;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: latest, error: latestErr } = await supabase
      .from("email_verification_codes")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("email", email)
      .eq("purpose", "signup")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestErr) throw new Error(`Failed to load verification code: ${latestErr.message}`);
    if (!latest) {
      return new Response(JSON.stringify({ error: "No code found. Please request a new verification code." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (latest.consumed_at) {
      return new Response(JSON.stringify({ error: "This code was already used. Please request a new one." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (latest.attempts >= 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please request a new code." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(latest.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "This code has expired. Please request a new one." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expected = latest.code_hash;
    const actual = await sha256(`${email}:${code}`);

    if (actual !== expected) {
      await supabase
        .from("email_verification_codes")
        .update({ attempts: (latest.attempts ?? 0) + 1 })
        .eq("id", latest.id);

      return new Response(JSON.stringify({ error: "Invalid code. Please try again." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark consumed before creating user
    const { error: consumeErr } = await supabase
      .from("email_verification_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", latest.id);
    if (consumeErr) throw new Error(`Failed to consume code: ${consumeErr.message}`);

    const { error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        name: parsed.data.name,
        country: parsed.data.country,
        age: parsed.data.age,
        profession: parsed.data.profession,
      },
    });

    if (createErr) {
      // If user exists, return a friendly error.
      const msg = createErr.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Please sign in instead."
        : createErr.message;
      return new Response(JSON.stringify({ error: msg }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-signup-code error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
