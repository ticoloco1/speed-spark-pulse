// Edge function: sitemap.xml — lists all pilots for SEO indexing.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const base = url.searchParams.get("base") ?? "https://hashpo.com";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data } = await supabase.from("pilots").select("slug, updated_at").limit(5000);
    const urls = [
      `<url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${base}/feed</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>`,
      `<url><loc>${base}/racing</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>`,
      ...(data ?? []).map(
        (p) =>
          `<url><loc>${base}/racing/profile/${p.slug}</loc><lastmod>${p.updated_at}</lastmod><priority>0.8</priority></url>`
      ),
    ].join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  } catch (e) {
    return new Response(String(e), { status: 500, headers: corsHeaders });
  }
});
