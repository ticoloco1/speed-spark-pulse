// Edge function: seed-pilot
// Creates AI-generated pilots (profile + bio + 5 posts + 1 blog) using service role.
// Body: { count: number, sponsor?: string }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COLORS = ["red", "green", "orange", "blue", "black", "yellow", "purple"];
const FLAGS = ["🇧🇷", "🇺🇸", "🇩🇪", "🇮🇹", "🇫🇷", "🇬🇧", "🇪🇸", "🇯🇵", "🇲🇽"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { count = 5 } = await req.json().catch(() => ({}));
    const n = Math.min(Math.max(1, count), 25);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tool = {
      type: "function",
      function: {
        name: "emit_pilots",
        description: "Return N synthetic racing pilots with bios, posts, and a blog article.",
        parameters: {
          type: "object",
          properties: {
            pilots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "UPPERCASE single word racing nickname" },
                  slug: { type: "string", description: "lowercase a-z0-9 only, 3-15 chars" },
                  number: { type: "integer", minimum: 1, maximum: 999 },
                  team: { type: "string" },
                  sponsor: { type: "string" },
                  bio: { type: "string", description: "1-2 sentences in Portuguese" },
                  posts: {
                    type: "array",
                    minItems: 4,
                    maxItems: 6,
                    items: { type: "string", description: "Tweet-length racing post in Portuguese" },
                  },
                  blog: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      excerpt: { type: "string" },
                    },
                    required: ["title", "excerpt"],
                  },
                },
                required: ["name", "slug", "number", "team", "sponsor", "bio", "posts", "blog"],
              },
            },
          },
          required: ["pilots"],
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
          { role: "system", content: "You generate realistic GT racing pilot personas for a Brazilian motorsport social network. Diverse names, never duplicate slugs." },
          { role: "user", content: `Generate ${n} unique racing pilot personas.` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_pilots" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "rate_limit" }), { status: 429, headers: corsHeaders });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "credits" }), { status: 402, headers: corsHeaders });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: corsHeaders });
    }

    const data = await resp.json();
    const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
    const pilots = args.pilots as any[];

    const inserted: any[] = [];
    for (let i = 0; i < pilots.length; i++) {
      const p = pilots[i];
      const slug = String(p.slug).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || `racer${Date.now()}${i}`;
      const { data: pilot, error: pErr } = await supabase
        .from("pilots")
        .insert({
          slug,
          name: String(p.name).toUpperCase().slice(0, 24),
          number: p.number,
          country: FLAGS[i % FLAGS.length],
          team: p.team,
          car_color: COLORS[i % COLORS.length],
          car_model: "gt3",
          sponsor: p.sponsor,
          bio: p.bio,
          is_ai: true,
        })
        .select()
        .single();
      if (pErr) {
        console.error("pilot insert", pErr);
        continue;
      }
      const postRows = (p.posts as string[]).map((text) => ({
        pilot_id: pilot.id,
        author_id: null,
        text,
        kind: "auto",
      }));
      // blog as a special post
      postRows.push({
        pilot_id: pilot.id,
        author_id: null,
        text: `📝 ${p.blog.title}\n\n${p.blog.excerpt}`,
        kind: "auto",
      });
      await supabase.from("pilot_posts").insert(postRows);
      inserted.push({ slug: pilot.slug, name: pilot.name });
    }

    return new Response(JSON.stringify({ created: inserted.length, pilots: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
