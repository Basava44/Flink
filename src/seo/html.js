// Server/build-time HTML for crawlers and link-preview bots (Google, GPTBot,
// PerplexityBot, WhatsApp, LinkedIn...) that read the raw HTML without running JS.
// Used by vite.config.js (homepage) and api/profile.js (profile + app routes).
import { HOME_FAQ } from "./faq.js";
import { COMPARE } from "./compare.js";

export const SITE_URL = "https://myflink.in";
export const DEFAULT_TITLE = "Flink - Free Link in Bio Page for Creators";
export const DEFAULT_DESC =
  "Create your free Flink page: one link for your Instagram, YouTube, WhatsApp, LinkedIn and contact details. Visitors can save you as a contact in one tap.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

// Same set PublicProfileView treats as contact info - never put these in server HTML
const CONTACT_PLATFORMS = new Set(["email", "phone", "whatsapp", "telegram"]);
const PLATFORM_LABELS = { twitter: "X (Twitter)", linkedin: "LinkedIn", youtube: "YouTube", github: "GitHub" };

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function toHttpUrl(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    // `user@host` URLs are usually emails typed into a link field - don't publish them
    if ((u.protocol !== "https:" && u.protocol !== "http:") || u.username || u.password) return null;
    return u.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function headTags({ title, description, path, image = DEFAULT_IMAGE, imageAlt, type = "website", noindex, schema }) {
  const url = `${SITE_URL}${path}`;
  const isDefaultImage = image === DEFAULT_IMAGE;
  const alt = imageAlt || "Flink - all your socials in one link";
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    noindex && `<meta name="robots" content="noindex, nofollow" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    isDefaultImage && `<meta property="og:image:width" content="1200" />`,
    isDefaultImage && `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta property="og:site_name" content="Flink" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="${isDefaultImage ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(alt)}" />`,
    schema && jsonLd(schema),
  ]
    .filter(Boolean)
    .join("\n    ");
}

// Hidden once JS runs (index.html adds `js` to <html>); React then replaces #root anyway.
const fallback = (inner) => `<div class="[.js_&]:hidden">${inner}</div>`;

export function injectSeo(html, { head, body }) {
  return html
    .replace(/<!--seo:head-->[\s\S]*?<!--\/seo:head-->/, `<!--seo:head-->\n    ${head}\n    <!--/seo:head-->`)
    .replace(/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/, `<!--seo:body-->${body}<!--/seo:body-->`);
}

export function homeSeo() {
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: "Flink",
    alternateName: "myflink",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        name: "Flink",
        alternateName: "myflink.in",
        url: `${SITE_URL}/`,
        description: DEFAULT_DESC,
        inLanguage: "en-IN",
        publisher: { "@id": org["@id"] },
      },
      {
        "@type": "WebApplication",
        name: "Flink",
        url: `${SITE_URL}/`,
        description:
          "Flink is a free link-in-bio page builder that puts all your social profiles, website and contact details behind one short link.",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        publisher: { "@id": org["@id"] },
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  const body = fallback(`
      <header><a href="/">Flink</a> <a href="/login">Log in</a> <a href="/login">Sign up</a></header>
      <main>
        <h1>All your socials. One link.</h1>
        <p>Stop sharing 10 different usernames. Create your Flink - a single link to all your social profiles, contact info, and more.</p>
        <h2>Why Flink?</h2>
        <ul>
          <li><strong>One link for everything</strong> - Instagram, WhatsApp, Twitter, LinkedIn, email, phone - all from a single URL.</li>
          <li><strong>Save as contact</strong> - Visitors can download your info directly to their phone with one tap.</li>
          <li><strong>Share anywhere</strong> - Bio, resume, email signature, business card, or QR code. It just works.</li>
        </ul>
        <h2>Ready in 60 seconds</h2>
        <ol><li>Sign up - free account with email or Google</li><li>Add your links - connect all your social profiles</li><li>Share your Flink - one link everywhere you go</li></ol>
        <h2>Frequently asked questions</h2>
        ${HOME_FAQ.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("\n        ")}
      </main>
      <footer><a href="/privacy">Privacy</a> <a href="/terms">Terms</a></footer>
    `);

  return { head: headTags({ title: DEFAULT_TITLE, description: DEFAULT_DESC, path: "/", schema }), body };
}

export function profileSeo({ profile, name, links }) {
  const handle = profile.handle;
  const displayName = name?.trim() || handle;
  const path = `/${handle}`;
  const title = `${displayName} (@${handle}) - Flink`;

  const publicLinks = links
    .filter((l) => !CONTACT_PLATFORMS.has(l.platform))
    .map((l) => ({
      href: toHttpUrl(l.url),
      label: l.platform === "custom" ? l.label || "Website" : PLATFORM_LABELS[l.platform] || l.platform.charAt(0).toUpperCase() + l.platform.slice(1),
    }))
    .filter((l) => l.href);
  const website = profile.website ? toHttpUrl(profile.website) : null;
  const platformNames = [...new Set(publicLinks.map((l) => l.label))];

  const description = profile.bio
    ? truncate(profile.bio.replace(/\s+/g, " ").trim(), 155)
    : platformNames.length
      ? `Connect with ${displayName} on ${platformNames.slice(0, 4).join(", ")} and more - all in one link on Flink.`
      : `Connect with ${displayName} - all their links in one place on Flink.`;

  const sameAs = [...new Set([...publicLinks.map((l) => l.href), website].filter(Boolean))];
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}${path}`,
    name: title,
    dateCreated: profile.created_at || undefined,
    dateModified: profile.updated_at || undefined,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: `@${handle}`,
      identifier: handle,
      url: `${SITE_URL}${path}`,
      image: profile.profile_url || undefined,
      description: profile.bio || undefined,
      homeLocation: profile.location ? { "@type": "Place", name: profile.location } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    },
  };

  const body = fallback(`
      <main>
        ${profile.profile_url ? `<img src="${esc(profile.profile_url)}" alt="${esc(displayName)}" width="96" height="96" />` : ""}
        <h1>${esc(displayName)}</h1>
        <p>@${esc(handle)}</p>
        ${profile.bio ? `<p>${esc(profile.bio)}</p>` : ""}
        ${profile.location ? `<p>${esc(profile.location)}</p>` : ""}
        <ul>
          ${publicLinks.map((l) => `<li><a href="${esc(l.href)}" rel="me noopener">${esc(l.label)}</a></li>`).join("\n          ")}
          ${website ? `<li><a href="${esc(website)}" rel="me noopener">Website</a></li>` : ""}
        </ul>
      </main>
      <footer><a href="/">Create your own free Flink page</a></footer>
    `);

  return {
    head: headTags({
      title,
      description,
      path,
      image: profile.profile_url || DEFAULT_IMAGE,
      imageAlt: `${displayName} on Flink`,
      type: "profile",
      schema,
    }),
    body,
  };
}

export function pageSeo({ title, path, description = DEFAULT_DESC, noindex }) {
  return { head: headTags({ title: `${title} - Flink`, description, path, noindex }), body: "" };
}

export function notFoundSeo(handle) {
  return {
    head: headTags({
      title: "Profile not found - Flink",
      description: `@${handle} doesn't exist on Flink. Claim it and create your own free Flink page.`,
      path: `/${handle}`,
      noindex: true,
    }),
    body: fallback(`<main><h1>Profile not found</h1><p><a href="/">Create your own free Flink page</a></p></main>`),
  };
}

export function compareSeo() {
  const body = fallback(`
      <main>
        <h1>${esc(COMPARE.h1)}</h1>
        <p>${esc(COMPARE.intro)}</p>
        <table>
          <thead><tr><th>Feature</th><th>Flink</th><th>Linktree</th></tr></thead>
          <tbody>${COMPARE.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        ${COMPARE.sections.map(({ h, p }) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join("\n        ")}
      </main>
      <footer><a href="/">Create your free Flink page</a></footer>
    `);
  return { head: headTags({ title: `${COMPARE.title} - Flink`, description: COMPARE.description, path: COMPARE.path }), body };
}
