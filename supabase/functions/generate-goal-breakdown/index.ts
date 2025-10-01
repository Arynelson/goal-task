import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * CORS
 */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * ENV - Backend FastAPI URL
 */
const backendUrl = Deno.env.get("FASTAPI_BACKEND_URL") || "http://localhost:8000";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" } as const;


/**
 * Handler HTTP - Proxy para FastAPI Backend
 */
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Faz proxy para o backend FastAPI
    const response = await fetch(`${backendUrl}/api/generate-goal-breakdown`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: jsonHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Edge Function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
