import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    // Session is already restored by useAuth listener; just route forward.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/pilot/setup", { replace: true });
      else navigate("/auth", { replace: true });
    });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-xs tracking-[0.2em] font-display font-bold text-muted-foreground">
        ENTRANDO NA PISTA…
      </div>
    </div>
  );
}
