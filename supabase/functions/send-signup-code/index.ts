import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  email: z.string().trim().email().max(255),
});

function sixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
    if (!RESEND_FROM_EMAIL) throw new Error("RESEND_FROM_EMAIL is not configured");

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = parsed.data.email.toLowerCase();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Basic rate limit: 1 code per minute per email
    const { data: latest, error: latestErr } = await supabase
      .from("email_verification_codes")
      .select("created_at")
      .eq("email", email)
      .eq("purpose", "signup")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestErr) {
      throw new Error(`Failed to check rate limit: ${latestErr.message}`);
    }
    if (latest?.created_at) {
      const createdAt = new Date(latest.created_at).getTime();
      if (Date.now() - createdAt < 60_000) {
        return new Response(JSON.stringify({ error: "Please wait a moment before requesting another code." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const code = sixDigitCode();
    const codeHash = await sha256(`${email}:${code}`);
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const { error: insertErr } = await supabase.from("email_verification_codes").insert({
      email,
      purpose: "signup",
      code_hash: codeHash,
      expires_at: expiresAt,
    });
    if (insertErr) throw new Error(`Failed to store code: ${insertErr.message}`);

    const resend = new Resend(RESEND_API_KEY);
    const { error: emailErr } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: "Your Epic Trader verification code",
      html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Verify your email</h2>
          <p style="margin: 0 0 12px;">Use this 6-digit code to finish creating your account:</p>
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; padding: 12px 16px; background: #f4f4f5; border-radius: 10px; display: inline-block;">${code}</div>
          <p style="margin: 12px 0 0; color: #52525b;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    if (emailErr) throw new Error(`Failed to send email: ${emailErr.message}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-signup-code error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
