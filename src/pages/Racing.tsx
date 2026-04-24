import { useEffect } from "react";
import { startEngine } from "@/racing/engine";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { TopTicker } from "@/racing/components/TopTicker";
import { BottomTicker } from "@/racing/components/BottomTicker";
import { BoostTrack } from "@/racing/components/BoostTrack";
import { HeroPanel } from "@/racing/components/HeroPanel";
import { RacingFeed } from "@/racing/components/RacingFeed";
import { EventTicker } from "@/racing/components/EventTicker";
import { LiveGrid } from "@/racing/components/LiveGrid";
import { GaragePanel } from "@/racing/components/GaragePanel";
import { SponsorStrip } from "@/racing/components/SponsorStrip";
import { WeatherHud } from "@/racing/components/WeatherHud";
import { InfiniteSideTrack } from "@/racing/components/InfiniteSideTrack";
import { InterviewTV } from "@/racing/components/InterviewTV";

export default function Racing() {
  useEffect(() => {
    startEngine();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <RacingHeader />
      <InfiniteSideTrack side="left" />

      <TopTicker />

      {/* Sponsors */}
      <div className="border-b border-border surface-1">
        <SponsorStrip variant="top" />
      </div>

      {/* Main 3-column layout */}
      <main className="flex-1 grid grid-cols-12 gap-3 p-3 xl:pl-28">
        {/* Left: Boost Track */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="sticky top-3 h-[calc(100vh-260px)] min-h-[600px]">
            <BoostTrack />
          </div>
        </div>

        {/* Center: Hero + Live Grid + Feed/Garage row */}
        <div className="col-span-12 md:col-span-9 lg:col-span-7 space-y-3">
          {/* Weather + page title */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight">
                LIVE BROADCAST
                <span className="ml-3 inline-flex items-center gap-1.5 align-middle">
                  <span className="live-dot" />
                  <span className="text-[11px] text-racing-red font-display font-bold tracking-widest">AO VIVO 24/7</span>
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">A motorsport-style attention economy. Always racing.</p>
            </div>
            <WeatherHud />
          </div>

          <HeroPanel />

          <LiveGrid />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3">
              <RacingFeed />
            </div>
            <div className="lg:col-span-2 space-y-3">
              <EventTicker />
              <GaragePanel />
            </div>
          </div>
        </div>

        {/* Right: secondary HUD column */}
        <div className="hidden lg:block col-span-12 lg:col-span-3 space-y-3">
          <InterviewTV />
          <ChampionshipPanel />
          <NftDropPanel />
        </div>
      </main>

      {/* Bottom 100-car ticker */}
      <BottomTicker />

      {/* All sponsors strip */}
      <div className="border-t border-border surface-1">
        <SponsorStrip variant="bottom" />
      </div>
    </div>
  );
}

function Top5() {
  return (
    <div className="space-y-1.5">
      {[
        { p: 1, n: "MARIE", t: "TrustBank", s: 25430 },
        { p: 2, n: "CRYPTOX", t: "Apex", s: 24120 },
        { p: 3, n: "SPEEDKING", t: "Velocity", s: 22340 },
        { p: 4, n: "ALEX99", t: "Phantom", s: 19880 },
        { p: 5, n: "FASTLIFE", t: "Nitro", s: 18210 },
      ].map((r) => (
        <div key={r.n} className="flex items-center gap-2 surface-2 rounded px-2 py-1.5 text-xs">
          <span className="font-display font-bold w-5 text-center">{r.p}</span>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold truncate">{r.n}</div>
            <div className="text-[10px] text-muted-foreground truncate">{r.t}</div>
          </div>
          <div className="text-racing-green font-mono font-bold tabular-nums">${(r.s / 1000).toFixed(1)}k</div>
        </div>
      ))}
    </div>
  );
}

function ChampionshipPanel() {
  return (
    <div className="surface-1 hud-border rounded-md p-3">
      <div className="text-[10px] tracking-[0.2em] font-display font-bold text-muted-foreground mb-2">
        CHAMPIONSHIP · WEEK 17
      </div>
      <div className="space-y-2">
        {[
          { l: "DAILY", v: "ENDS 04:21:09", c: "racing-amber" },
          { l: "WEEKLY", v: "3D 11H LEFT", c: "racing-red" },
          { l: "MONTHLY", v: "12D LEFT", c: "racing-green" },
          { l: "ANNUAL", v: "248D LEFT", c: "racing-blue" },
        ].map((r) => (
          <div key={r.l} className="flex items-center justify-between text-xs surface-2 rounded px-2 py-1.5">
            <span className="font-display font-bold tracking-widest text-[10px]">{r.l}</span>
            <span className={`font-mono tabular-nums text-[11px] text-${r.c}`}>{r.v}</span>
          </div>
        ))}
      </div>
      <button className="mt-3 w-full py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90">
        VER PRÊMIOS
      </button>
    </div>
  );
}

function NftDropPanel() {
  return (
    <div className="surface-1 hud-border rounded-md p-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-racing-purple/10 via-transparent to-racing-red/10 pointer-events-none" />
      <div className="relative">
        <div className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-purple mb-1">
          NFT EDITION DROP
        </div>
        <div className="font-display font-bold text-base">Marie · #7 · Pole Lap</div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Race moment captured at 02:41.328 — limited lazy mint.
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest">MINT PRICE</div>
            <div className="font-mono font-bold text-racing-amber">0.025 ETH</div>
          </div>
          <button className="px-3 py-1.5 rounded bg-foreground text-background text-[10px] font-display font-bold tracking-widest hover:bg-foreground/90">
            COLLECT
          </button>
        </div>
      </div>
    </div>
  );
}
