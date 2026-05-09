/**
 * Subdomain router for hashpo.com
 *
 *  slug.hashpo.com   → pilot profile by slug   (e.g. marie.hashpo.com)
 *  7.hashpo.com      → pilot profile by car #  (numeric subdomain)
 *  www.hashpo.com    → main site
 *  hashpo.com        → main site
 *  *.lovable.app     → main site (preview / staging)
 *  localhost         → main site
 *
 * DNS required in production:
 *   *.hashpo.com  A   185.158.133.1
 *   hashpo.com    A   185.158.133.1
 */

export type SubdomainTarget =
  | { kind: "main" }
  | { kind: "pilot-slug"; slug: string }
  | { kind: "pilot-number"; number: number };

const ROOT_DOMAINS = ["hashpo.com"];
const IGNORED_SUBDOMAINS = new Set(["", "www", "app", "admin"]);

export function detectSubdomain(hostname = window.location.hostname): SubdomainTarget {
  // Local / preview hosts → main site
  if (
    hostname === "localhost" ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return { kind: "main" };
  }

  const root = ROOT_DOMAINS.find((d) => hostname === d || hostname.endsWith("." + d));
  if (!root) return { kind: "main" };

  const sub = hostname.slice(0, -root.length).replace(/\.$/, "");
  if (IGNORED_SUBDOMAINS.has(sub)) return { kind: "main" };

  // Numeric → car number
  if (/^\d{1,4}$/.test(sub)) {
    return { kind: "pilot-number", number: parseInt(sub, 10) };
  }

  // Single-label slug only (no nested subdomains)
  if (/^[a-z0-9][a-z0-9-]{0,62}$/i.test(sub)) {
    return { kind: "pilot-slug", slug: sub.toLowerCase() };
  }

  return { kind: "main" };
}
