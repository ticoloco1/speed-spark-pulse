import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Chrome } from "lucide-react";

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/pilot/setup", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 surface-1 border-b border-border flex items-center px-4">
        <Link to="/racing" className="flex items-center gap-1.5 text-xs font-display font-bold tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> VOLTAR
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md surface-1 hud-border rounded-lg p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="live-dot" />
              <span className="text-[10px] tracking-[0.2em] font-display font-bold text-racing-red">
                TRUSTBANK RACING
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl tracking-tight">Entrar na pista</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Crie seu piloto, suba sua foto, customize seu carro e dispute em tempo real.
            </p>
          </div>

          <Button
            onClick={() => signInWithGoogle()}
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-display font-bold tracking-wider"
          >
            <Chrome className="w-5 h-5 mr-2" />
            ENTRAR COM GOOGLE
          </Button>

          <p className="text-[10px] text-center text-muted-foreground tracking-wider">
            Ao continuar você concorda com correr no limite. Sem login você pode ver tudo, mas
            só donos editam seus pilotos.
          </p>
        </div>
      </main>
    </div>
  );
}
