// Live race commentary streaming via Lovable AI Gateway.
// Returns SSE stream with token-by-token narration.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CommentaryRequest {
  leader?: { name: string; number: number; team: string } | null;
  recentEvents?: Array<{ kind: string; message: string }>;
  weather?: string;
  trackCondition?: string;
  online?: number;
  lap?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as CommentaryRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const events = (body.recentEvents ?? []).slice(0, 8).map((e) => `- [${e.kind}] ${e.message}`).join("\n");
    const leader = body.leader ? `${body.leader.name} (#${body.leader.number}, ${body.leader.team})` : "líder atual";

    const userPrompt = [
      `Você é o LOCUTOR OFICIAL da TrustBank Racing — uma corrida 24/7 ao vivo estilo F1.`,
      `Narre 3-4 frases curtas, ritmo de transmissão de TV, em PORTUGUÊS BRASILEIRO.`,
      `Use linguagem energética, gírias de automobilismo (DRS, slipstream, ápice, undercut), sem emojis.`,
      ``,
      `Estado atual:`,
      `- Líder: ${leader}`,
      `- Clima: ${body.weather ?? "clear"} · pista ${body.trackCondition ?? "dry"}`,
      `- Online: ${body.online?.toLocaleString() ?? "-"} espectadores`,
      `- Volta atual: ${body.lap ?? "-"}`,
      ``,
      `Eventos recentes:`,
      events || "- (sem eventos relevantes)",
      ``,
      `Narre AGORA, no presente, como se estivesse vendo a corrida.`,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um locutor profissional de automobilismo. Respostas curtas, ao vivo, sem markdown." },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados — adicione créditos ao workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("race-commentary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
