// Supabase Edge Function: gemini-chat
// Handles AI travel chat requests securely on the server side with strict JWT Auth requirement

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory per-user rate limiting map (User ID -> { count, resetTime })
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 chat requests per 10-minute window per authenticated user
const WINDOW_DURATION_MS = 10 * 60 * 1000;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    let userId: string | null = null;
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (user && !userError) {
        userId = user.id;
      } else if (userError) {
        console.error("[gemini-chat] JWT Auth verification failed:", userError.message);
      }
    }

    // STRICT REQUIREMENT: Reject unauthenticated requests with HTTP 401
    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            userMessage: "Authentication required to access GoTrip AI features. Please log in.",
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate Limiting Check strictly by authenticated User ID (derived from auth.uid())
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId) || { count: 0, resetTime: now + WINDOW_DURATION_MS };
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + WINDOW_DURATION_MS;
    }

    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      return new Response(
        JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            userMessage: "You have exceeded your chat request limit. Please wait a few minutes before trying again.",
          },
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userLimit.count += 1;
    rateLimitMap.set(userId, userLimit);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: "AI_CONFIGURATION_ERROR",
            userMessage: "AI service key is missing on the server.",
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { history, userMessage, imageBase64, location, language = "English" } = await req.json();

    const primaryModel = "gemini-3.8-flash";
    const fallbackModel = "gemini-3.5-flash-lite";

    // Helper to invoke Gemini API REST endpoint securely from Deno
    const callGeminiAPI = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      const userParts: any[] = [{ text: userMessage || "Analyze" }];
      if (imageBase64) {
        userParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(",")[1] || imageBase64,
          },
        });
      }

      contents.push({ role: "user", parts: userParts });

      const payload = {
        contents,
        systemInstruction: {
          parts: [
            {
              text: `You are an advanced travel assistant. 1. Respond strictly in ${language} language. 2. Provide 3 brief follow-up questions in ${language} at the end after '---RELATED---'.`,
            },
          ],
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 429 || errorText.includes("RESOURCE_EXHAUSTED") || errorText.includes("quota")) {
          const err: any = new Error("RESOURCE_EXHAUSTED");
          err.status = 429;
          throw err;
        }
        throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
      }

      return await res.json();
    };

    let responseData: any;
    try {
      responseData = await callGeminiAPI(primaryModel);
    } catch (err: any) {
      if (err.status === 429) {
        return new Response(
          JSON.stringify({
            error: {
              code: "QUOTA_EXHAUSTED",
              userMessage: "AI service limit reached. Please try again later.",
            },
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Controlled Fallback to secondary model
      try {
        responseData = await callGeminiAPI(fallbackModel);
      } catch (fallbackErr: any) {
        return new Response(
          JSON.stringify({
            error: {
              code: fallbackErr.status === 429 ? "QUOTA_EXHAUSTED" : "SERVER_ERROR",
              userMessage: "AI service is currently unavailable. Please try again later.",
            },
          }),
          { status: fallbackErr.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    let fullText = candidateText;
    let relatedQuestions: string[] = [];

    const relatedSplit = fullText.split("---RELATED---");
    if (relatedSplit.length > 1) {
      fullText = relatedSplit[0].trim();
      relatedQuestions = relatedSplit[1]
        .trim()
        .split("\n")
        .map((q: string) => q.replace(/^- /, "").trim())
        .slice(0, 3);
    }

    return new Response(
      JSON.stringify({
        data: {
          text: fullText,
          sources: [],
          relatedQuestions,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: {
          code: "SERVER_ERROR",
          userMessage: "An internal error occurred processing your AI request.",
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
