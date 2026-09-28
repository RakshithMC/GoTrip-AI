// Supabase Edge Function: check-account
// Securely verifies whether an email address is registered on the server side
// Uses SUPABASE_SERVICE_ROLE_KEY on the server only. Never exposes secrets or user data to the client.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory rate-limiting map (Key -> { count, resetTime })
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 checks per 5-minute window per IP
const WINDOW_DURATION_MS = 5 * 60 * 1000;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // IP/Client Rate Limiting
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
  const now = Date.now();
  const rateData = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + WINDOW_DURATION_MS };

  if (now > rateData.resetTime) {
    rateData.count = 0;
    rateData.resetTime = now + WINDOW_DURATION_MS;
  }

  rateData.count++;
  rateLimitMap.set(clientIp, rateData);

  if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
    return new Response(
      JSON.stringify({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please wait a while and try again.",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = String(body.email || "").trim().toLowerCase();

    // Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return new Response(
        JSON.stringify({ registered: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[check-account] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "SERVICE_UNAVAILABLE", message: "Server configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Check public.profiles for registered email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", rawEmail)
      .maybeSingle();

    let registered = !!profile;

    // 2. Fallback: Check Auth Admin API if profile record was not found directly
    if (!registered) {
      try {
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (!usersError && usersData?.users) {
          registered = usersData.users.some(
            (u) => (u.email || "").trim().toLowerCase() === rawEmail
          );
        }
      } catch (_e) {
        // Fallback check error handled gracefully
      }
    }

    // Safe dev log only: no passwords, tokens, or private info
    console.log(`[check-account] operation=account-check result=${registered ? "registered" : "not_registered"}`);

    // Return minimal payload ONLY
    return new Response(
      JSON.stringify({ registered }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[check-account] Error handling account check:", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: "Unable to verify the account right now. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
