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

  const authenticatedClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authorization } } },
  );

  const { data: { user: requestingUser } } = await authenticatedClient.auth.getUser();
  if (requestingUser?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonResponse({ error: "Only the Epic Trader admin can manage user accounts." }, 403);
  }

  const { userId, action } = await request.json().catch(() => ({ userId: "", action: "" }));
  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return jsonResponse({ error: "A valid user ID is required." }, 400);
  }

  if (action !== "block" && action !== "delete") {
    return jsonResponse({ error: "Choose a valid account action." }, 400);
  }

  if (userId === requestingUser.id) {
    return jsonResponse({ error: "You cannot manage your own admin account from this screen." }, 400);
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: targetUserData, error: targetUserError } = await adminClient.auth.admin.getUserById(userId);
  const targetUser = targetUserData?.user;
  if (targetUserError || !targetUser) {
    return jsonResponse({ error: "The selected user account was not found." }, 404);
  }

  if (targetUser.email?.toLowerCase() === ADMIN_EMAIL) {
    return jsonResponse({ error: "The Epic Trader admin account cannot be managed here." }, 403);
  }

  if (action === "block") {
    const { error: blockError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });

    if (blockError) {
      console.error("Block user failed:", blockError.message);
      return jsonResponse({ error: "The user could not be blocked." }, 502);
    }

    return jsonResponse({ success: true, action: "block" });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("Delete user failed:", deleteError.message);
    return jsonResponse({ error: "The user could not be deleted. Check for dependent database records." }, 502);
  }

  await Promise.all([
    adminClient.from("profiles").delete().eq("id", userId),
    adminClient.from("user_activity_events").delete().eq("user_id", userId),
  ]);

  return jsonResponse({ success: true, action: "delete" });
});
