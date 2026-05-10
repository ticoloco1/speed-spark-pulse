// Edge function: generate-seo
// Input: { kind: "pilot" | "site", pilot?: {...}, url: string }
// Output: { title, description, jsonLd }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, pilot, url, extra } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys =
      "You are an SEO expert for a racing social network (Hashpo). " +
      "Return ONLY valid JSON via the provided tool. Titles <60 chars, descriptions <160 chars, " +
      "use racing keywords (motorsport, GT3, lap, sponsor, championship). " +
      "Build schema.org JSON-LD that Google can parse: Person + SportsTeam for pilots, WebSite for sites.";

    const userPrompt =
      kind === "pilot"
        ? `Generate SEO for pilot profile at ${url}. Pilot data: ${JSON.stringify(pilot)}. Extra: ${JSON.stringify(extra ?? {})}`
        : `Generate SEO for racing mini-site at ${url}. Context: ${JSON.stringify(extra ?? {})}`;

    const tool = {
      type: "function",
      function: {
        name: "emit_seo",
        description: "Return SEO metadata and JSON-LD",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            jsonLd: {
              type: "object",
              description: "Valid schema.org JSON-LD object (with @context and @type)",
            },
          },
          required: ["title", "description", "jsonLd"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_seo" } },
      }),
    });

    if (resp.status === 429)
      return new Response(JSON.stringify({ error: "rate_limit" }), { status: 429, headers: corsHeaders });
    if (resp.status === 402)
      return new Response(JSON.stringify({ error: "credits" }), { status: 402, headers: corsHeaders });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: corsHeaders });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("no tool call");

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
