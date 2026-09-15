const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = "https://flink-smoky.vercel.app";

const BOT_AGENTS = /bot|crawl|spider|slurp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Discordbot|TelegramBot|Embedly|Quora Link Preview|Slack|vkShare|redditbot|Applebot|ia_archiver|Pinterest/i;

// Static routes that should never be intercepted
const STATIC_PATHS = new Set(["/", "/login", "/forgot-password", "/reset-password", "/settings", "/help"]);

export const config = {
  matcher: "/:handle",
};

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_AGENTS.test(ua)) return;

  const url = new URL(request.url);
  const handle = url.pathname.slice(1);

  if (!handle || STATIC_PATHS.has(url.pathname) || handle.includes(".")) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/flink_profiles?handle=eq.${encodeURIComponent(handle)}&select=bio,profile_url,user_id`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const profiles = await res.json();
    if (!profiles?.length) return;

    const profile = profiles[0];

    // Fetch user name
    let name = handle;
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${profile.user_id}&select=name`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const users = await userRes.json();
    if (users?.length && users[0].name) {
      name = users[0].name;
    }

    const title = `${name} (@${handle}) | Flink`;
    const description = profile.bio || `Check out ${name}'s links on Flink`;
    const image = profile.profile_url || `${SITE_URL}/og-image.png`;
    const pageUrl = `${SITE_URL}/${handle}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:site_name" content="Flink" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
  <meta http-equiv="refresh" content="0;url=${esc(pageUrl)}" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return;
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
