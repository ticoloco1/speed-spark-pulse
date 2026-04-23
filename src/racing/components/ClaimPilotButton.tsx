import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Flag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/racing/db";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Pilot, CarColor } from "@/racing/types";

interface ClaimPilotButtonProps {
  pilot: Pilot;
  /** True when the slug is not yet bound to a DB record (pure AI). */
  isAvailable: boolean;
}

const KNOWN_COLORS: CarColor[] = ["red", "blue", "green", "orange", "yellow", "purple", "black"];

export function ClaimPilotButton({ pilot, isAvailable }: ClaimPilotButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasOwnPilot, setHasOwnPilot] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasOwnPilot(null);
      return;
    }
    db.getMyPilot(user.id)
      .then((p) => setHasOwnPilot(!!p))
      .catch(() => setHasOwnPilot(false));
  }, [user]);

  if (!isAvailable || authLoading) return null;

  const handleClaim = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (hasOwnPilot) {
      toast({
        title: "Você já tem um piloto",
        description: "Cada usuário pode ter apenas um piloto. Edite o seu antes de reivindicar outro.",
        variant: "destructive",
      });
      return;
    }
    setClaiming(true);
    try {
      const carColor: CarColor = KNOWN_COLORS.includes(pilot.carColor as CarColor)
        ? (pilot.carColor as CarColor)
        : "red";
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const created = await db.createPilot({
        owner_id: user.id,
        slug: pilot.slug,
        name: pilot.name,
        number: pilot.number,
        country: pilot.country,
        team: pilot.team,
        car_color: carColor,
        car_model: "gt3",
        sponsor: pilot.sponsor,
        photo_url: meta.avatar_url ?? null,
        bio: null,
        is_ai: false,
        claimed_from_ai: pilot.id,
      });
      toast({ title: "Piloto reivindicado!", description: `Você agora controla #${created.number} ${created.name}.` });
      navigate("/pilot/setup");
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      toast({
        title: "Não foi possível reivindicar",
        description: msg.includes("unique") || msg.includes("duplicate")
          ? "Esse slug acabou de ser reivindicado por outra pessoa."
          : msg,
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="surface-2 hud-border rounded-md p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded bg-racing-amber/15 flex items-center justify-center shrink-0">
        <Flag className="w-4 h-4 text-racing-amber" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground tracking-widest font-display">SLUG DISPONÍVEL</div>
        <div className="text-xs font-display font-bold truncate">
          Reivindique <span className="text-racing-amber">/{pilot.slug}</span> para o seu perfil
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleClaim}
        disabled={claiming || hasOwnPilot === true}
        className="bg-racing-amber text-background hover:bg-racing-amber/90 font-display font-bold tracking-widest text-[10px] px-3"
      >
        {claiming ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
        {!user ? "ENTRAR P/ REIVINDICAR" : hasOwnPilot ? "JÁ TEM PILOTO" : "REIVINDICAR"}
      </Button>
    </div>
  );
}
