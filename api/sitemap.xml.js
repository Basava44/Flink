/* global process */
const SITE_URL = "https://myflink.in";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    // Fetch all public (non-private) profile handles
    const profiles = await fetchPublicProfiles();

    const urls = [
      { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
      { loc: `${SITE_URL}/privacy`, priority: "0.3", changefreq: "yearly" },
      { loc: `${SITE_URL}/terms`, priority: "0.3", changefreq: "yearly" },
    ];

    for (const p of profiles) {
      urls.push({
        loc: `${SITE_URL}/${p.handle}`,
        priority: "0.7",
        changefreq: "weekly",
      });
    }

    const xml = buildSitemapXml(urls);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    // Return a minimal valid sitemap on error
    const fallback = buildSitemapXml([
      { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
    ]);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(fallback);
  }
}

async function fetchPublicProfiles() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const profiles = [];
  let offset = 0;
  const limit = 1000;

  // Paginate through all public profiles
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/flink_profiles?is_private=eq.false&select=handle&order=created_at.asc&offset=${offset}&limit=${limit}`;
    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!resp.ok) break;

    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const row of batch) {
      if (row.handle) profiles.push(row);
    }

    if (batch.length < limit) break;
    offset += limit;
  }

  return profiles;
}

function buildSitemapXml(urls) {
  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escXml(u.loc)}</loc>${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ""}${u.priority ? `\n    <priority>${u.priority}</priority>` : ""}\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function escXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
