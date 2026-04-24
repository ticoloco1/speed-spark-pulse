// Generates a short pit/post-race/breaking interview snippet for a pilot.
// Returns JSON: { headline, lowerThird, quote }.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InterviewRequest {
  pilot: { name: string; number: number; team: string; sponsor: string; country?: string };
  format?: "pit" | "post-race" | "breaking" | "grid";
  context?: string;
}

const FORMAT_LABEL: Record<string, string> = {
  pit: "PIT INTERVIEW",
  "post-race": "POST-RACE COMMENT",
  breaking: "BREAKING NEWS",
  grid: "GRID WALK",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as InterviewRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const fmt = body.format ?? "pit";
    const lowerThird = FORMAT_LABEL[fmt] ?? "LIVE";

    const prompt = [
      `Gere uma entrevista CURTA estilo TV para o piloto ${body.pilot.name} #${body.pilot.number} (${body.pilot.team}, patrocinador ${body.pilot.sponsor}).`,
      `Formato: ${lowerThird}.`,
      body.context ? `Contexto: ${body.context}` : "",
      `Responda APENAS com JSON válido (sem markdown) com as chaves:`,
      `- "headline": manchete em CAIXA ALTA, ate 60 chars, em portugues do Brasil.`,
      `- "quote": fala do piloto em primeira pessoa, 1 ou 2 frases (max 180 chars), tom energetico.`,
    ].filter(Boolean).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é redator esportivo. Responda apenas JSON válido, sem comentários." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_interview",
            description: "Emite a entrevista estruturada.",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string" },
                quote: { type: "string" },
              },
              required: ["headline", "quote"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_interview" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed = { headline: `${body.pilot.name.toUpperCase()} EM ALTA`, quote: "Estamos voando hoje, o carro está perfeito." };
    if (args) {
      try { parsed = JSON.parse(args); } catch { /* keep fallback */ }
    }

    return new Response(JSON.stringify({ lowerThird, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pilot-interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
