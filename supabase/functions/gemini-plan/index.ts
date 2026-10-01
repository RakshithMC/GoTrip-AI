// Supabase Edge Function: gemini-plan
// Handles structured AI generation (summaries, city guides, country databases, day trip itineraries) securely on the server side with strict JWT Auth requirement

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_WINDOW = 20; // Max 20 plan generations per 10-minute window per authenticated user
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
        console.error("[gemini-plan] JWT Auth verification failed:", userError.message);
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
            userMessage: "You have exceeded your plan generation request limit. Please wait a few minutes before trying again.",
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

    const { action, payload } = await req.json();

    const primaryModel = "gemini-3.8-flash";
    const fallbackModel = "gemini-3.5-flash-lite";

    const callGeminiAPI = async (model: string, promptText: string, jsonMode: boolean = false) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const bodyPayload: any = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      };

      if (jsonMode) {
        bodyPayload.generationConfig = { responseMimeType: "application/json" };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
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

    let promptText = "";
    let isJson = false;

    if (action === "summary") {
      const { attractionName, cityName, language = "English" } = payload;
      promptText = `Write a captivating, short (3 sentences) travel summary for ${attractionName} in ${cityName}. Focus on why a tourist must visit. CRITICAL: Write the response entirely in ${language} language.`;
    } else if (action === "cityGuide") {
      const { city, country, language = "English" } = payload;
      promptText = `You are a travel-data generator for my trip-planning app. For the city ${city}, ${country}, generate a structured list of the most important and popular places for travelers.
      CRITICAL: You must provide exact decimal LATITUDE and LONGITUDE for every single place.
      Return the result as clean JSON with an array called places, where each item has: name, category, short_description (max 40 words), approx_visit_time_hours, best_time_to_visit, ideal_for, nearby_area, latitude, and longitude.
      IMPORTANT: All text fields MUST be written in ${language} language.`;
      isJson = true;
    } else if (action === "countryDatabase") {
      const { country, language = "English" } = payload;
      promptText = `Generate top 30 unique tourist places for ${country}.
      Return CLEAN JSON with an array places.
      Each place must have: name, category, short_description, approx_visit_time_hours, best_time_to_visit, ideal_for, nearby_area, latitude, longitude.
      CRITICAL: Write all text descriptions and names in ${language} language.`;
      isJson = true;
    } else if (action === "dayTrip") {
      const { city, places, language = "English" } = payload;
      const placeList = Array.isArray(places) ? places.map((p: any) => p.name || p).join(", ") : String(places);
      promptText = `Generate a 1-day trip itinerary for ${city} featuring these places: ${placeList}.
      Return a JSON array of objects with fields: time, placeName, activity. Write descriptions in ${language}.`;
      isJson = true;
    } else if (action === "replan") {
      // ── Feature 2: Dynamic Trip Replanning ──────────────────────────────────
      const {
        originalActivity,
        prevActivity,
        nextActivity,
        destination,
        dates,
        budget,
        dayNumber,
        fullReason,
        theme = "General",
        preferences: replanPrefs,
      } = payload;

      const prevCtx = prevActivity
        ? `Previous activity: "${prevActivity.name}" at ${prevActivity.time}.`
        : "No previous activity (this is the first activity of the day).";
      const nextCtx = nextActivity
        ? `Next activity: "${nextActivity.name}" at ${nextActivity.time}.`
        : "No next activity (this is the last activity of the day).";

      const prefCtx = replanPrefs
        ? `
USER LEARNED PREFERENCES (from Feature 1 AI Preference Learning):
- Preferred categories: ${(replanPrefs.likes || []).join(", ") || "None specified"}
- Disliked categories: ${(replanPrefs.dislikes || []).join(", ") || "None"}
- Travel style: ${replanPrefs.travelStyle || "Balanced"}
- Trip pace: ${replanPrefs.tripPace || "Moderate"}
- Budget range: ${replanPrefs.budgetMin ?? "unset"} – ${replanPrefs.budgetMax ?? "unset"}
Strongly prefer alternatives matching liked categories. Avoid disliked categories.`
        : "";

      promptText = `You are a professional travel planner performing a targeted itinerary adjustment for GoTrip AI.

TRIP CONTEXT:
- Destination: ${destination}
- Dates: ${dates}
- Trip theme: ${theme}
- Total budget: ${budget}
- Day: ${dayNumber}

DISRUPTION:
The following activity cannot proceed.
- Activity name: "${originalActivity.name}"
- Scheduled time: ${originalActivity.time}
- Reason it cannot proceed: ${fullReason}

SCHEDULE CONTEXT:
- ${prevCtx}
- ${nextCtx}

YOUR TASK:
Generate ONE replacement activity that:
1. Fits the same approximate time slot (${originalActivity.time}).
2. Is geographically practical given ${prevCtx} and ${nextCtx}.
3. Does NOT suggest "${originalActivity.name}" or any activity by another name that is clearly the same place.
4. Respects the trip budget of ${budget}.
5. Is feasible and realistic for ${destination}.
6. Includes a concise explanation of why you chose it.${prefCtx}

GROUNDING & EXPLAINABILITY RULES:
- In the "reason" field, use ONLY the factual information supplied in the context (preferences, schedule context, disruption reason, destination).
- Do NOT invent prices, exact distances, ratings, opening times, availability, or preferences not provided.
- Every claim in "reason" must be traceable to the supplied inputs.
- Keep the reason concise (1-2 sentences).

RETURN FORMAT — pure JSON, no markdown, exactly this shape:
{
  "replacement": {
    "time": "...",
    "name": "...",
    "description": "...",
    "icon": "activity",
    "latitude": 0.0,
    "longitude": 0.0
  },
  "reason": "1-2 sentences: grounded explanation of why this replacement was chosen based on supplied inputs.",
  "scheduleImpact": "None" | "Minor adjustment — schedule fits well" | "Schedule adjusted to fit the replacement.",
  "estimatedBudgetImpact": 0
}`;
      isJson = true;
    } else {
      return new Response(
        JSON.stringify({ error: { code: "MALFORMED_RESPONSE", userMessage: "Invalid action type." } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { preferences } = payload || {};
    if (preferences) {
      const likes = Array.isArray(preferences.likes) && preferences.likes.length > 0 ? preferences.likes.join(", ") : "General";
      const dislikes = Array.isArray(preferences.dislikes) && preferences.dislikes.length > 0 ? preferences.dislikes.join(", ") : "None";
      const style = preferences.travelStyle || "Balanced";
      promptText += `\nUSER LEARNED PREFERENCES CONTEXT: Preferred Categories: [${likes}]. Disliked Categories: [${dislikes}]. Travel Style: ${style}. Emphasize places matching user likes and minimize/avoid places matching user dislikes.`;
    }

    let responseData: any;
    try {
      responseData = await callGeminiAPI(primaryModel, promptText, isJson);
    } catch (err: any) {
      if (err.status === 429) {
        return new Response(
          JSON.stringify({
            error: { code: "QUOTA_EXHAUSTED", userMessage: "AI service limit reached. Please try again later." },
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      try {
        responseData = await callGeminiAPI(fallbackModel, promptText, isJson);
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

    const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!isJson) {
      return new Response(
        JSON.stringify({ data: rawText || "No summary available." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(rawText || "{}");
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: { code: "MALFORMED_RESPONSE", userMessage: "Received invalid JSON from AI service." } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processedData: any = parsedResult;

    if (action === "cityGuide" || action === "countryDatabase") {
      processedData = (parsedResult.places || []).map((p: any) => ({
        ...p,
        nearby_area: p.nearby_area || p.area_or_neighbourhood || "Unknown",
        lat: p.latitude || p.lat,
        lng: p.longitude || p.lng,
      }));
    } else if (action === "dayTrip") {
      const list = Array.isArray(parsedResult) ? parsedResult : parsedResult.itinerary || parsedResult.places || [];
      processedData = list.map((item: any) => ({
        time: item.time || "09:00 AM",
        placeName: item.placeName || item.name || "Attraction",
        activity: item.activity || item.description || item.short_description || "Visit and explore.",
      }));
    } else if (action === "replan") {
      // Normalize the replan result into a stable shape
      const rep = parsedResult.replacement || {};
      processedData = {
        replacement: {
          time: rep.time || payload.originalActivity?.time || "09:00 AM",
          name: rep.name || "Alternative Activity",
          description: rep.description || "A curated replacement for your itinerary.",
          icon: rep.icon === "food" ? "food" : rep.icon === "travel" ? "travel" : "activity",
          latitude: typeof rep.latitude === "number" ? rep.latitude : undefined,
          longitude: typeof rep.longitude === "number" ? rep.longitude : undefined,
          isReplanned: true,
          replanReason: payload.fullReason || "User request",
        },
        reason: parsedResult.reason || "This activity fits your schedule and preferences.",
        scheduleImpact: parsedResult.scheduleImpact || "None",
        estimatedBudgetImpact: typeof parsedResult.estimatedBudgetImpact === "number"
          ? parsedResult.estimatedBudgetImpact
          : null,
      };
    }

    return new Response(
      JSON.stringify({ data: processedData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_ERROR", userMessage: "An internal error occurred processing your AI plan request." },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
