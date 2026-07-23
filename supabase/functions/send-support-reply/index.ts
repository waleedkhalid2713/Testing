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

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse({ error: "You must sign in as admin." }, 401);
  }

  const authenticatedClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authorization } } },
  );

  const { data: { user } } = await authenticatedClient.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonResponse({ error: "Only the Epic Trader admin can send support replies." }, 403);
  }

  const { messageId, reply } = await request.json().catch(() => ({ messageId: "", reply: "" }));
  if (typeof messageId !== "string" || !/^[0-9a-f-]{36}$/i.test(messageId)) {
    return jsonResponse({ error: "A valid support message ID is required." }, 400);
  }

  if (typeof reply !== "string" || reply.trim().length < 2 || reply.trim().length > 5000) {
    return jsonResponse({ error: "Enter a reply between 2 and 5,000 characters." }, 400);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return jsonResponse({ error: "Support email is not configured." }, 503);
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: message, error: messageError } = await serviceClient
    .from("contact_messages")
    .select("id, name, email, subject")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    return jsonResponse({ error: "Support message was not found." }, 404);
  }

  const supportEmail = Deno.env.get("SUPPORT_EMAIL") ?? ADMIN_EMAIL;
  const fromEmail = Deno.env.get("SUPPORT_FROM_EMAIL") ?? "Epic Trader Support <onboarding@resend.dev>";
  const ticketReference = message.id.slice(0, 8).toUpperCase();
  const cleanReply = reply.trim();

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [message.email],
      reply_to: supportEmail,
      subject: `Re: [Epic Trader #${ticketReference}] ${message.subject}`,
      text: [
        `Hello ${message.name},`,
        "",
        cleanReply,
        "",
        "Kind regards,",
        "Epic Trader Support",
      ].join("\n"),
      html: `
        <p>Hello ${escapeHtml(message.name)},</p>
        <p>${escapeHtml(cleanReply).replace(/\n/g, "<br />")}</p>
        <p>Kind regards,<br /><strong>Epic Trader Support</strong></p>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const details = await emailResponse.text();
    console.error("Support reply delivery failed:", details);
    return jsonResponse({ error: "The reply email could not be delivered. Please try again." }, 502);
  }

  const { error: updateError } = await serviceClient
    .from("contact_messages")
    .update({ status: "In progress" })
    .eq("id", message.id);

  if (updateError) {
    console.error("Support status update failed:", updateError.message);
    return jsonResponse({ error: "The reply was sent, but its status could not be updated." }, 500);
  }

  return jsonResponse({ delivered: true, status: "In progress" });
});
