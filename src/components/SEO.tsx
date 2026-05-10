import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Lightweight SEO injector — sets <title>, meta description, canonical,
 * Open Graph, Twitter, and JSON-LD. Works for SPA routes (Google now
 * renders JS), and the same data is exposed to crawlers via the DOM.
 */
export function SEO({ title, description, canonical, image, type = "website", jsonLd }: SEOProps) {
  useEffect(() => {
    document.title = title.length > 60 ? title.slice(0, 57) + "..." : title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [a, v] = selector.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(a, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description.slice(0, 160));
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description.slice(0, 160));
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description.slice(0, 160));
    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
      setMeta('meta[name="twitter:image"]', "content", image);
    }

    // canonical
    const href = canonical ?? window.location.href;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // JSON-LD
    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((s) => s.remove());
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const data of arr) {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-seo-jsonld", "1");
        s.text = JSON.stringify(data);
        document.head.appendChild(s);
      }
    }
  }, [title, description, canonical, image, type, JSON.stringify(jsonLd)]);

  return null;
}
