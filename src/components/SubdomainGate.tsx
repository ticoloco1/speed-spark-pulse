import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectSubdomain } from "@/lib/subdomain";
import { ALL_PILOTS } from "@/racing/pilots";

/**
 * Reads the current hostname and rewrites the route to the matching
 * pilot profile when the user landed via slug.hashpo.com or N.hashpo.com.
 * Runs once on mount; the URL bar keeps the subdomain.
 */
export function SubdomainGate() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return; // only rewrite the bare root
    const target = detectSubdomain();
    if (target.kind === "pilot-slug") {
      navigate(`/racing/profile/${target.slug}`, { replace: true });
    } else if (target.kind === "pilot-number") {
      const pilot = ALL_PILOTS.find((p) => p.number === target.number);
      if (pilot) navigate(`/racing/profile/${pilot.slug}`, { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
}
