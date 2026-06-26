import { useEffect } from "react";
import { useLocation } from "wouter";
import { getRouteMeta } from "@/lib/route-meta";

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta() {
  const [location] = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(location);
    const { title, description } = meta;
    const url = window.location.href;
    const image =
      window.location.origin +
      (import.meta.env.BASE_URL ?? "/") +
      "opengraph.jpg";

    document.title = title;

    setMeta("description", description);

    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:url", url);
    setProperty("og:image", image);
    setProperty("og:site_name", "AETHER Knowledge System");
    setProperty("og:type", "website");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  }, [location]);
}
