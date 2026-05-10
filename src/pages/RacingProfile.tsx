import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ALL_PILOTS } from "@/racing/pilots";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { CarRenderer } from "@/racing/components/CarRenderer";
import { InfiniteSideTrack } from "@/racing/components/InfiniteSideTrack";
import { BottomTicker } from "@/racing/components/BottomTicker";
import { TopTicker } from "@/racing/components/TopTicker";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { PorscheGT3Banner } from "@/racing/components/PorscheGT3Banner";
import { RaceVideosPanel } from "@/racing/components/RaceVideosPanel";
import {
  BadgeCheck, Share2, MessageCircle, UserPlus, Heart, Repeat2,
  Rocket, Flag, Trophy, Link as LinkIcon, Instagram, Twitter, Globe,
} from "lucide-react";

type Tab = "feed" | "blog" | "links";

export default function RacingProfile() {
  const { slug } = useParams();
  const pilot = useMemo(
    () => ALL_PILOTS.find((p) => p.slug === (slug ?? "marie")) ?? ALL_PILOTS[0],
    [slug]
  );
  const suggestions = useMemo(
    () => ALL_PILOTS.filter((p) => p.slug !== pilot.slug).slice(0, 6),
    [pilot]
  );
  const [tab, setTab] = useState<Tab>("feed");
  const [following, setFollowing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <RacingHeader />
      <InfiniteSideTrack side="left" />
      <TopTicker />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 xl:pl-32">
        {/* LEFT: Suggested pilots as little cars */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <div className="surface-1 hud-border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-[0.2em] font-display font-bold">
                PILOTOS SUGERIDOS
              </span>
              <Flag className="w-3 h-3 text-racing-red" />
            </div>
            <div className="space-y-2">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  to={`/racing/profile/${p.slug}`}
                  className="flex items-center gap-2 surface-2 hud-border rounded p-2 hover:bg-secondary transition-colors"
                >
                  <div className="w-16 h-8 shrink-0">
                    <CarRenderer pilot={p} view="side" speed={0.4} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-display font-bold truncate">
                      #{p.number} {p.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">
                      @{p.slug} · {p.team}
                    </div>
                  </div>
                  <button className="text-[9px] font-display font-bold tracking-widest px-2 py-1 rounded bg-racing-red text-primary-foreground hover:opacity-90">
                    SEGUIR
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-1 hud-border rounded-md p-3">
            <div className="text-[10px] tracking-[0.2em] font-display font-bold mb-2">
              PATROCINAR ESTE PILOTO
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Coloque sua marca no carro #{pilot.number}. Aparece na pista lateral, no
              topo da página e nas postagens patrocinadas.
            </p>
            <button className="w-full py-2 rounded bg-racing-amber text-background text-[10px] font-display font-bold tracking-widest hover:opacity-90">
              SPONSOR · A PARTIR DE $99
            </button>
          </div>

          {/* Race videos 16:9 with sponsor auction overlay */}
          <RaceVideosPanel />
        </aside>

        {/* CENTER: Profile + tabs */}
        <section className="col-span-12 lg:col-span-6 space-y-3">
          {/* Hero — Carro + foto piloto à esquerda, pista atrás */}
          <PorscheGT3Banner pilotName={pilot.name} number={pilot.number} defaultSponsorDoor={pilot.sponsor} />
          <div className="surface-1 hud-border rounded-lg overflow-hidden">
            <div className="relative h-2 bg-gradient-to-r from-racing-red via-racing-amber to-racing-purple" />

            <div className="px-4 pb-4 pt-4 relative">
              <div className="flex items-end gap-4">
                {/* Avatar / foto piloto à esquerda */}
                <div className="w-24 h-24 rounded-2xl hud-border surface-2 overflow-hidden shrink-0 ring-4 ring-background">
                  <div className="w-full h-full bg-gradient-to-br from-racing-red/40 to-racing-purple/40 flex items-center justify-center font-display font-bold text-3xl">
                    {pilot.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-bold text-2xl truncate">{pilot.name}</h1>
                    <BadgeCheck className="w-5 h-5 text-racing-amber" />
                    <span className="text-2xl">{pilot.country}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    @{pilot.slug} · {pilot.team} · #{pilot.number}
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-foreground/80 mt-3">
                Piloto da {pilot.team}. Patrocínio principal por {pilot.sponsor}. Melhor
                volta {pilot.bestLap}. Disputando GT PRO. Colecionador de momentos NFT.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setFollowing((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-display font-bold tracking-widest ${
                    following
                      ? "surface-2 hud-border"
                      : "bg-racing-red text-primary-foreground"
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  {following ? "SEGUINDO" : "SEGUIR"}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded surface-2 hud-border text-[10px] font-display font-bold tracking-widest">
                  <MessageCircle className="w-3 h-3" /> MENSAGEM
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded surface-2 hud-border text-[10px] font-display font-bold tracking-widest">
                  <Share2 className="w-3 h-3" /> COMPARTILHAR
                </button>
                <Link
                  to={`/racing/${pilot.slug}`}
                  className="ml-auto text-[10px] font-display font-bold tracking-widest text-racing-red hover:underline"
                >
                  VER GARAGEM →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <Stat label="VITÓRIAS" value="37" />
                <Stat label="VOLTAS" value="2.4k" />
                <Stat label="SEGUIDORES" value="18.2k" />
                <Stat label="SPONSORS" value="9" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="surface-1 hud-border rounded-md">
            <div className="flex border-b border-border">
              <TabBtn active={tab === "feed"} onClick={() => setTab("feed")}>FEED</TabBtn>
              <TabBtn active={tab === "blog"} onClick={() => setTab("blog")}>BLOG</TabBtn>
              <TabBtn active={tab === "links"} onClick={() => setTab("links")}>LINKS</TabBtn>
            </div>

            {tab === "feed" && <FeedTab pilotName={pilot.name} sponsor={pilot.sponsor} />}
            {tab === "blog" && <BlogTab pilotName={pilot.name} />}
            {tab === "links" && <LinksTab />}
          </div>
        </section>

        {/* RIGHT: Sponsor live + championship */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <div className="surface-1 hud-border rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="live-dot" />
              <span className="text-[10px] text-racing-red font-display font-bold tracking-widest">
                SPONSOR AO VIVO
              </span>
            </div>
            <div className="surface-2 hud-border rounded p-2">
              <div className="text-[10px] text-muted-foreground tracking-widest font-display">
                AGORA
              </div>
              <div className="font-display font-bold text-base">{pilot.sponsor}</div>
              <div className="text-[10px] text-muted-foreground">
                $1.240 / 25s · próximo lance em 8s
              </div>
              <div className="mt-2 h-1 bg-border rounded overflow-hidden">
                <div className="h-full bg-racing-amber" style={{ width: "62%" }} />
              </div>
            </div>
            <button className="mt-3 w-full py-1.5 rounded bg-racing-amber text-background text-[10px] font-display font-bold tracking-widest hover:opacity-90">
              DAR LANCE
            </button>
          </div>

          <div className="surface-1 hud-border rounded-md p-3">
            <div className="text-[10px] tracking-[0.2em] font-display font-bold text-muted-foreground mb-2">
              CONQUISTAS
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2"><Trophy className="w-3 h-3 text-racing-amber" /> Campeão Semanal · S16</li>
              <li className="flex items-center gap-2"><Rocket className="w-3 h-3 text-racing-red" /> Pole Position · 12x</li>
              <li className="flex items-center gap-2"><Flag className="w-3 h-3 text-racing-green" /> Volta mais rápida · {pilot.bestLap}</li>
            </ul>
          </div>
        </aside>
      </main>

      <BottomTicker />
    </div>
  );
}

const TabBtn = ({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-[10px] font-display font-bold tracking-[0.2em] border-b-2 transition-colors ${
      active ? "border-racing-red text-racing-red" : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="surface-2 hud-border rounded px-2 py-1.5 text-center">
    <div className="font-display font-bold text-base leading-none">{value}</div>
    <div className="text-[9px] text-muted-foreground tracking-widest mt-0.5">{label}</div>
  </div>
);

const FeedTab = ({ pilotName, sponsor }: { pilotName: string; sponsor: string }) => {
  const posts = [
    { kind: "post", text: "Largada perfeita hoje! Pneus aguentando além do esperado 🔥", time: "2h", likes: 482, comments: 38, retweets: 27 },
    { kind: "sponsored", text: `Parceria oficial com ${sponsor}. Combustível que entrega resultado em pista.`, time: "5h", likes: 1240, comments: 102, retweets: 89 },
    { kind: "post", text: "Treino classificatório em 30min. Vamos buscar a pole 🏁", time: "1d", likes: 891, comments: 67, retweets: 43 },
  ];
  return (
    <div>
      <div className="p-3 border-b border-border">
        <textarea
          placeholder="Compartilhe sua corrida..."
          className="w-full bg-background border border-border rounded-md p-2 text-sm resize-none focus:outline-none focus:border-racing-red"
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <button className="px-4 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90">
            POSTAR
          </button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {posts.map((p, i) => (
          <article key={i} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full surface-2 hud-border flex items-center justify-center font-display font-bold text-xs">
                {pilotName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-display font-bold flex items-center gap-1.5">
                  {pilotName} <BadgeCheck className="w-3 h-3 text-racing-amber" />
                  {p.kind === "sponsored" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-racing-amber text-background tracking-widest">PATROCINADO</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">{p.time} atrás</div>
              </div>
            </div>
            <p className="text-[13px] text-foreground/90 ml-10">{p.text}</p>
            <div className="flex items-center gap-4 mt-2 ml-10 text-[11px] text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-racing-red"><Heart className="w-3 h-3" /> {p.likes}</button>
              <button className="flex items-center gap-1 hover:text-racing-green"><Repeat2 className="w-3 h-3" /> {p.retweets}</button>
              <button className="flex items-center gap-1 hover:text-racing-blue"><MessageCircle className="w-3 h-3" /> {p.comments}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const BlogTab = ({ pilotName }: { pilotName: string }) => {
  const articles = [
    { title: "Como conquistei a pole em Interlagos", excerpt: "Técnica de freada tardia e leitura de grip nas curvas 1 e 4...", date: "12 abr", read: "5 min" },
    { title: "Setup de chassi para pista molhada", excerpt: "Ajustes finos de suspensão e mapa de motor para condições adversas...", date: "03 abr", read: "8 min" },
  ];
  return (
    <div className="divide-y divide-border">
      {articles.map((a, i) => (
        <article key={i} className="p-4 hover:bg-secondary/30 cursor-pointer">
          <div className="text-[10px] text-racing-red font-display font-bold tracking-widest mb-1">
            BLOG · {a.date} · {a.read}
          </div>
          <h3 className="font-display font-bold text-base mb-1">{a.title}</h3>
          <p className="text-[12px] text-muted-foreground">{a.excerpt}</p>
          <div className="text-[10px] text-muted-foreground mt-2">por {pilotName}</div>
        </article>
      ))}
    </div>
  );
};

const LinksTab = () => {
  const links = [
    { icon: <Instagram className="w-4 h-4" />, label: "Instagram", url: "#", color: "from-[hsl(330_80%_55%)] to-[hsl(20_90%_55%)]" },
    { icon: <Twitter className="w-4 h-4" />, label: "Twitter / X", url: "#", color: "from-foreground to-foreground/70" },
    { icon: <Globe className="w-4 h-4" />, label: "Site oficial", url: "#", color: "from-racing-purple to-racing-red" },
    { icon: <LinkIcon className="w-4 h-4" />, label: "Loja de NFTs", url: "#", color: "from-racing-amber to-racing-red" },
  ];
  return (
    <div className="p-3 space-y-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          className={`flex items-center justify-center gap-2 py-3 rounded-md bg-gradient-to-r ${l.color} text-primary-foreground font-display font-bold tracking-widest text-[12px] hover:opacity-90`}
        >
          {l.icon} {l.label}
        </a>
      ))}
    </div>
  );
};
