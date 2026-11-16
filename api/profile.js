/* global process */
// Serves index.html for every single-segment route (see vercel.json) with
// per-page title, canonical, Open Graph and JSON-LD injected, so crawlers and
// link-preview bots that don't run JS see the real profile instead of the homepage.
import { injectSeo, profileSeo, pageSeo, notFoundSeo } from "../src/seo/html.js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const STATIC_PAGES = {
  privacy: { title: "Privacy Policy", path: "/privacy" },
  terms: { title: "Terms of Service", path: "/terms" },
};
const APP_PAGES = {
  login: "Log in",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  settings: "Settings",
  help: "Help & Support",
  analytics: "Analytics",
};

let templatePromise;
function getTemplate(req) {
  if (!templatePromise) {
    const proto = req.headers["x-forwarded-proto"] || "https";
    templatePromise = fetch(`${proto}://${req.headers.host}/index.html`).then((r) => {
      if (!r.ok) throw new Error(`index.html ${r.status}`);
      return r.text();
    });
    templatePromise.catch(() => { templatePromise = undefined; });
  }
  return templatePromise;
}

async function query(path) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!resp.ok) throw new Error(`Supabase ${resp.status}`);
  return resp.json();
}

// Returns null when the profile doesn't exist or is private (RLS hides private rows)
async function loadProfile(handle) {
  const [profile] = await query(
    `flink_profiles?handle=eq.${encodeURIComponent(handle)}&select=user_id,handle,bio,location,website,profile_url,created_at,updated_at&limit=1`
  );
  if (!profile) return null;
  const [users, links] = await Promise.all([
    query(`users?id=eq.${profile.user_id}&select=name,profile_url&limit=1`),
    query(`social_links?user_id=eq.${profile.user_id}&select=platform,url,label&order=display_order.asc,created_at.asc`),
  ]);
  const user = users[0] || {};
  return {
    profile: { ...profile, profile_url: profile.profile_url || user.profile_url },
    name: user.name,
    links,
  };
}

export default async function handler(req, res) {
  const handle = String(req.query.handle || "").toLowerCase();
  let template;
  try {
    template = await getTemplate(req);
  } catch (err) {
    console.error("Profile SEO: template fetch failed", err);
    res.status(502).send("Temporarily unavailable");
    return;
  }

  const send = (status, seo, cache) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", cache);
    res.status(status).send(injectSeo(template, seo));
  };

  if (STATIC_PAGES[handle]) return send(200, pageSeo(STATIC_PAGES[handle]), "public, s-maxage=86400");
  if (APP_PAGES[handle]) {
    return send(200, pageSeo({ title: APP_PAGES[handle], path: `/${handle}`, noindex: true }), "public, s-maxage=86400");
  }

  // Without DB access, serve a self-canonical shell rather than a misleading 404
  const fallbackSeo = pageSeo({ title: `@${handle}`, path: `/${handle}` });
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return send(200, fallbackSeo, "no-store");

  try {
    const data = await loadProfile(handle);
    if (!data) return send(404, notFoundSeo(handle), "public, s-maxage=60");
    return send(200, profileSeo(data), "public, s-maxage=600, stale-while-revalidate=86400");
  } catch (err) {
    console.error("Profile SEO: lookup failed", err);
    return send(200, fallbackSeo, "no-store");
  }
}
