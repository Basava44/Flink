import { useEffect } from "react";
import { SITE_URL } from "../utils/constants";
import { DEFAULT_TITLE, DEFAULT_DESC } from "../seo/html";

// Pass null to leave the current (server-rendered) tags untouched
export function useDocumentMeta(meta = {}) {
  const skip = meta === null;
  const { title, description, path, ogImage, noindex } = meta || {};
  useEffect(() => {
    if (skip) return;
    const fullTitle = title ? `${title} - Flink` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const url = path ? `${SITE_URL}${path}` : SITE_URL;
    const image = ogImage || `${SITE_URL}/og-image.png`;

    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);

    // Handle noindex for auth-only pages
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [skip, title, description, path, ogImage, noindex]);
}
