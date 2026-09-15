import { useEffect } from "react";

const DEFAULT_TITLE = "Flink - All Your Socials. One Link.";
const DEFAULT_DESC = "Flink puts all your social profiles, contact info, and links in one beautiful page. Share a single link instead of juggling usernames.";
const SITE_URL = "https://flink-smoky.vercel.app";

export function useDocumentMeta({ title, description, path, ogImage } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Flink` : DEFAULT_TITLE;
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

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, path, ogImage]);
}
