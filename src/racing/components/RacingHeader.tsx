import { Link, useNavigate } from "react-router-dom";
import { Bell, Fuel, Gem, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db, type DbPilot } from "@/racing/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RacingHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [myPilot, setMyPilot] = useState<DbPilot | null>(null);

  useEffect(() => {
    if (!user) { setMyPilot(null); return; }
    db.getMyPilot(user.id).then(setMyPilot).catch(() => setMyPilot(null));
  }, [user]);

  const meta = user?.user_metadata as Record<string, string> | undefined;
  const avatarUrl = myPilot?.photo_url || meta?.avatar_url;

  return (
    <header className="h-14 surface-1 border-b border-border flex items-center justify-between px-4 z-30">
      <Link to="/racing" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-racing-red to-racing-red/60 flex items-center justify-center font-display font-bold text-sm">
          T
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold tracking-tight text-base">TRUSTBANK</div>
          <div className="text-[9px] text-racing-red font-display font-bold tracking-[0.2em] -mt-0.5">RACING ⚡</div>
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-1 ml-4">
        <Link to="/racing" className="text-[11px] font-display font-bold tracking-widest px-3 py-1.5 rounded hover:bg-secondary">
          AO VIVO
        </Link>
        <Link to="/feed" className="text-[11px] font-display font-bold tracking-widest px-3 py-1.5 rounded hover:bg-secondary">
          FEED
        </Link>
        <Link to="/admin/seed" className="text-[11px] font-display font-bold tracking-widest px-3 py-1.5 rounded hover:bg-secondary text-racing-amber">
          IA SEED
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 surface-2 rounded px-2.5 py-1.5">
          <Fuel className="w-3.5 h-3.5 text-racing-amber" />
          <span className="font-mono text-xs font-bold tabular-nums">$25,430</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 surface-2 rounded px-2.5 py-1.5">
          <Gem className="w-3.5 h-3.5 text-racing-red" />
          <span className="font-mono text-xs font-bold tabular-nums">3,240</span>
        </div>
        <button className="p-2 rounded hover:bg-secondary transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-racing-red rounded-full" />
        </button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 surface-2 rounded-full pr-3 pl-1 py-1 hover:bg-secondary transition-colors">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-racing-red to-racing-purple flex items-center justify-center text-[10px] font-display font-bold">
                    {(meta?.full_name ?? "U").slice(0, 1)}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-display font-bold tracking-wider truncate max-w-[120px]">
                  {myPilot ? `#${myPilot.number} ${myPilot.name}` : meta?.full_name ?? "PILOTO"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {myPilot ? (
                <DropdownMenuItem onClick={() => navigate(`/racing/${myPilot.slug}`)}>
                  <UserIcon className="w-4 h-4 mr-2" /> Meu perfil
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => navigate("/pilot/setup")}>
                <UserIcon className="w-4 h-4 mr-2" /> {myPilot ? "Editar piloto" : "Criar piloto"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-racing-red text-primary-foreground text-[10px] font-display font-bold tracking-widest hover:opacity-90"
          >
            <LogIn className="w-3.5 h-3.5" /> ENTRAR
          </Link>
        )}
      </div>
    </header>
  );
};
