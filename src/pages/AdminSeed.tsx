import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { Loader2, Sparkles, Bot } from "lucide-react";

export default function AdminSeed() {
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const run = async () => {
    setBusy(true);
    setLog((l) => [...l, `→ Gerando ${count} pilotos com IA...`]);
    try {
      const { data, error } = await supabase.functions.invoke("seed-pilot", { body: { count } });
      if (error) throw error;
      setLog((l) => [...l, `✓ ${data.created} pilotos criados`, ...data.pilots.map((p: any) => `   #${p.slug} — ${p.name}`)]);
    } catch (e: any) {
      setLog((l) => [...l, `✗ Erro: ${e.message ?? String(e)}`]);
    } finally {
      setBusy(false);
    }
  };

  const seoFor = async (slug: string) => {
    setLog((l) => [...l, `→ Gerando SEO IA para ${slug}...`]);
    const { data, error } = await supabase.functions.invoke("generate-seo", {
      body: { kind: "pilot", url: `https://${slug}.hashpo.com`, pilot: { slug } },
    });
    if (error) setLog((l) => [...l, `✗ ${error.message}`]);
    else setLog((l) => [...l, `✓ ${data.title}`, `  ${data.description}`]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Hashpo Admin — Seed Mini-Sites com IA"
        description="Gere pilotos, perfis, posts e blogs automaticamente com IA para popular o Hashpo."
      />
      <RacingHeader />
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <Bot className="w-6 h-6 text-racing-amber" /> Gerador de Mini-Sites IA
        </h1>
        <p className="text-sm text-muted-foreground">
          Cria pilotos completos (nome, slug, bio, sponsor, 5 posts, 1 blog) usando IA. Cada piloto vira um mini-site em <code>slug.hashpo.com</code>.
        </p>

        <div className="surface-1 hud-border rounded-lg p-4 space-y-3">
          <label className="block text-[10px] font-display tracking-widest">QUANTOS PILOTOS (1-25)</label>
          <input
            type="number"
            min={1}
            max={25}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full bg-background border border-border rounded-md p-2"
          />
          <button
            disabled={busy}
            onClick={run}
            className="flex items-center gap-2 px-4 py-2 rounded bg-racing-red text-primary-foreground font-display font-bold tracking-widest text-[11px] disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            GERAR COM IA
          </button>
        </div>

        <div className="surface-1 hud-border rounded-lg p-4 max-h-[60vh] overflow-auto font-mono text-[11px] space-y-1">
          {log.length === 0 && <div className="text-muted-foreground">Pronto.</div>}
          {log.map((l, i) => (
            <div key={i} className={l.startsWith("✓") ? "text-racing-green" : l.startsWith("✗") ? "text-racing-red" : ""}>
              {l}
            </div>
          ))}
        </div>

        <div className="surface-1 hud-border rounded-lg p-4">
          <div className="text-[10px] font-display tracking-widest mb-2">GERAR SEO IA POR SLUG</div>
          <SeoForm onSubmit={seoFor} />
        </div>
      </main>
    </div>
  );
}

const SeoForm = ({ onSubmit }: { onSubmit: (slug: string) => void }) => {
  const [slug, setSlug] = useState("marie");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (slug) onSubmit(slug);
      }}
      className="flex gap-2"
    >
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="marie"
        className="flex-1 bg-background border border-border rounded-md p-2 text-sm"
      />
      <button className="px-3 py-2 rounded bg-racing-amber text-background text-[10px] font-display font-bold tracking-widest">
        GERAR SEO
      </button>
    </form>
  );
};
