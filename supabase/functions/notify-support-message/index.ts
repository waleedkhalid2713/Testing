import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] ?? character));

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const { messageId } = await request.json().catch(() => ({ messageId: "" }));
  if (typeof messageId !== "string" || !/^[0-9a-f-]{36}$/i.test(messageId)) {
    return jsonResponse({ error: "A valid support message ID is required." }, 400);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return jsonResponse({ error: "Support email is not configured." }, 503);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: message, error: messageError } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, category, message, created_at")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    return jsonResponse({ error: "Support message was not found." }, 404);
  }

  const supportEmail = Deno.env.get("SUPPORT_EMAIL") ?? "epictrader.support@gmail.com";
  const fromEmail = Deno.env.get("SUPPORT_FROM_EMAIL") ?? "Epic Trader Website <onboarding@resend.dev>";
  const ticketReference = message.id.slice(0, 8).toUpperCase();

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [supportEmail],
      reply_to: message.email,
      subject: `[Epic Trader #${ticketReference}] ${message.subject}`,
      text: [
        "New Epic Trader support request",
        "",
        `Ticket: #${ticketReference}`,
        `Name: ${message.name}`,
        `Email: ${message.email}`,
        `Category: ${message.category}`,
        `Submitted: ${message.created_at}`,
        "",
        message.message,
      ].join("\n"),
      html: `
        <h2>New Epic Trader support request</h2>
        <p><strong>Ticket:</strong> #${ticketReference}</p>
        <p><strong>Name:</strong> ${escapeHtml(message.name)}<br />
        <strong>Email:</strong> ${escapeHtml(message.email)}<br />
        <strong>Category:</strong> ${escapeHtml(message.category)}<br />
        <strong>Submitted:</strong> ${escapeHtml(message.created_at)}</p>
        <p><strong>Message</strong></p>
        <p>${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const details = await emailResponse.text();
    console.error("Support email delivery failed:", details);
    return jsonResponse({ error: "Support email could not be delivered." }, 502);
  }

  return jsonResponse({ delivered: true });
});
