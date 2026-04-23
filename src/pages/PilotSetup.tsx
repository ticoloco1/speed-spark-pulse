import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/racing/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CarRenderer } from "@/racing/components/CarRenderer";
import type { CarColor } from "@/racing/types";
import { CAR_TINTS } from "@/racing/cars";
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CAR_COLORS: CarColor[] = ["red", "blue", "green", "orange", "yellow", "purple", "black"];
const CAR_MODELS = [
  { id: "gt3", label: "GT3" },
  { id: "hyper", label: "HYPERCAR" },
  { id: "f1", label: "F1" },
  { id: "muscle", label: "MUSCLE" },
  { id: "ev", label: "EV" },
];
const FLAGS = ["🇧🇷", "🇺🇸", "🇩🇪", "🇮🇹", "🇫🇷", "🇬🇧", "🇪🇸", "🇯🇵", "🇨🇦", "🇲🇽", "🇦🇷", "🇳🇱", "🏁"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

export default function PilotSetup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [existingId, setExistingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [number, setNumber] = useState(77);
  const [country, setCountry] = useState("🇧🇷");
  const [team, setTeam] = useState("INDEPENDENT");
  const [sponsor, setSponsor] = useState("TRUSTBANK");
  const [carColor, setCarColor] = useState<CarColor>("red");
  const [carModel, setCarModel] = useState("gt3");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    db.getMyPilot(user.id).then((p) => {
      if (p) {
        setExistingId(p.id);
        setName(p.name);
        setNumber(p.number);
        setCountry(p.country);
        setTeam(p.team);
        setSponsor(p.sponsor);
        setCarColor(p.car_color);
        setCarModel(p.car_model);
        setBio(p.bio ?? "");
        setPhotoUrl(p.photo_url);
      } else {
        const meta = user.user_metadata as Record<string, string> | undefined;
        setName(meta?.full_name ?? meta?.name ?? "Pilot");
        setPhotoUrl(meta?.avatar_url ?? null);
      }
    });
  }, [user, loading, navigate]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const url = await db.uploadPilotPhoto(user.id, file);
      setPhotoUrl(url);
      toast({ title: "Foto enviada", description: "Sua foto está pronta para o macacão." });
    } catch (e) {
      toast({ title: "Erro no upload", description: String(e), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(name) || `pilot-${Date.now()}`;
      const payload = {
        owner_id: user.id,
        slug,
        name: name.trim(),
        number,
        country,
        team,
        car_color: carColor,
        car_model: carModel,
        sponsor,
        photo_url: photoUrl,
        bio: bio.trim() || null,
        is_ai: false,
        claimed_from_ai: null,
      };
      let saved;
      if (existingId) {
        saved = await db.updatePilot(existingId, payload);
      } else {
        saved = await db.createPilot(payload);
      }
      toast({ title: "Piloto salvo", description: "Bem-vindo à grid!" });
      navigate(`/racing/${saved.slug}`);
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: e?.message?.includes("unique") ? "Esse nome (slug) já existe, escolha outro." : String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 surface-1 border-b border-border flex items-center justify-between px-4">
        <Link to="/racing" className="flex items-center gap-1.5 text-xs font-display font-bold tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> LIVE BROADCAST
        </Link>
        <span className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red">
          {existingId ? "EDITAR PILOTO" : "CRIAR PILOTO"}
        </span>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form */}
        <section className="surface-1 hud-border rounded-lg p-5 space-y-4">
          <div>
            <Label htmlFor="name">Nome do piloto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Speedking" />
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">URL: /racing/{slugify(name) || "your-name"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                type="number"
                min={1}
                max={999}
                value={number}
                onChange={(e) => setNumber(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
              />
            </div>
            <div>
              <Label>País</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {FLAGS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setCountry(f)}
                    className={`text-xl p-1 rounded ${country === f ? "ring-2 ring-racing-red" : "opacity-60 hover:opacity-100"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="team">Equipe</Label>
            <Input id="team" value={team} onChange={(e) => setTeam(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="sponsor">Patrocinador principal</Label>
            <Input id="sponsor" value={sponsor} onChange={(e) => setSponsor(e.target.value.toUpperCase())} />
          </div>

          <div>
            <Label>Modelo do carro</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {CAR_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCarModel(m.id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-display font-bold tracking-wider border ${
                    carModel === m.id ? "bg-racing-red text-primary-foreground border-racing-red" : "border-border hover:border-foreground/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Cor do carro</Label>
            <div className="flex gap-2 mt-1">
              {CAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCarColor(c)}
                  className={`w-9 h-9 rounded-full border-2 ${carColor === c ? "border-foreground scale-110" : "border-border"}`}
                  style={{ background: CAR_TINTS[c] }}
                  aria-label={c}
                >
                  {carColor === c && <Check className="w-4 h-4 mx-auto text-background" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Sou rápido nas curvas e mais rápido nas retas."
              rows={3}
            />
          </div>

          <div>
            <Label>Foto do piloto (rosto)</Label>
            <label className="mt-1 flex items-center justify-center gap-2 px-3 py-3 surface-2 hud-border rounded cursor-pointer hover:border-racing-red transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="text-xs font-display font-bold tracking-widest">
                {photoUrl ? "TROCAR FOTO" : "ENVIAR FOTO"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
            </label>
          </div>

          <Button
            onClick={save}
            disabled={saving}
            size="lg"
            className="w-full bg-racing-red text-primary-foreground hover:bg-racing-red/90 font-display font-bold tracking-widest"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {existingId ? "SALVAR ALTERAÇÕES" : "ENTRAR NA GRID"}
          </Button>
        </section>

        {/* Preview */}
        <aside className="surface-1 hud-border rounded-lg p-5 space-y-4 sticky top-4 self-start">
          <div className="text-[10px] tracking-[0.2em] font-display font-bold text-muted-foreground">PRÉ-VISUALIZAÇÃO</div>

          <div className="aspect-[16/9] surface-2 rounded overflow-hidden grid place-items-center p-3">
            <CarRenderer color={carColor} model={carModel as any} view="hero" className="w-full h-full" />
          </div>

          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-racing-red" />
            ) : (
              <div className="w-14 h-14 rounded-full surface-3 border border-border flex items-center justify-center text-xs font-display font-bold">
                {name.slice(0, 2).toUpperCase() || "??"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-racing-red font-display font-bold text-2xl">#{number}</span>
                <span className="font-display font-bold text-lg truncate">{name || "Sem nome"}</span>
                <span>{country}</span>
              </div>
              <div className="text-[10px] text-racing-red font-display font-bold tracking-widest">
                {team.toUpperCase()} · {sponsor}
              </div>
            </div>
          </div>

          {bio && <p className="text-xs text-foreground/80 leading-snug">{bio}</p>}
        </aside>
      </main>
    </div>
  );
}
