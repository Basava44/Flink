import { useEffect } from "react";
import { SITE_URL } from "../utils/constants";

const DEFAULT_TITLE = "Flink - All Your Social Links in One Place";
const DEFAULT_DESC = "Create your free Flink page to share your social media profiles, website, and contact details with one simple link.";

export function useDocumentMeta({ title, description, path, ogImage, noindex } = {}) {
  useEffect(() => {
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
  }, [title, description, path, ogImage, noindex]);
}
