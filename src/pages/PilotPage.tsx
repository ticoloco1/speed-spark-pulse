import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { startEngine, useRaceStore } from "@/racing/engine";
import { RacingHeader } from "@/racing/components/RacingHeader";
import { TopTicker } from "@/racing/components/TopTicker";
import { BottomTicker } from "@/racing/components/BottomTicker";
import { HeroPanel } from "@/racing/components/HeroPanel";
import { LiveGrid } from "@/racing/components/LiveGrid";
import { GaragePanel } from "@/racing/components/GaragePanel";
import { RacingFeed } from "@/racing/components/RacingFeed";
import { EventTicker } from "@/racing/components/EventTicker";
import { SponsorStrip } from "@/racing/components/SponsorStrip";
import { WeatherHud } from "@/racing/components/WeatherHud";
import { ArrowLeft } from "lucide-react";

export default function PilotPage() {
  const { slug } = useParams<{ slug: string }>();
  const pilot = useRaceStore((s) => s.pilots.find((p) => p.slug === slug));

  useEffect(() => {
    startEngine();
  }, []);

  if (!pilot) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <RacingHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="font-display font-bold text-3xl">Pilot not found</h1>
          <Link to="/racing" className="text-racing-red hover:underline">← Back to live broadcast</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <RacingHeader />
      <TopTicker />
      <div className="border-b border-border surface-1">
        <SponsorStrip variant="top" />
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/racing" className="flex items-center gap-1.5 text-xs font-display font-bold tracking-widest text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> LIVE BROADCAST
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-display font-bold text-xl tracking-tight">
              <span className="text-racing-red">#{pilot.number}</span> {pilot.name}
            </h1>
            <span className="text-xs font-mono text-muted-foreground">
              1.{pilot.slug}.trustbank.xyz
            </span>
          </div>
          <WeatherHud />
        </div>

        <HeroPanel />
        <LiveGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RacingFeed />
          </div>
          <div className="space-y-4">
            <EventTicker />
            <GaragePanel />
          </div>
        </div>
      </main>

      <BottomTicker />
      <div className="border-t border-border surface-1">
        <SponsorStrip variant="bottom" />
      </div>
    </div>
  );
}
