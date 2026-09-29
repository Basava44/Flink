import { supabase } from "./supabase";

// Simple visitor fingerprint based on browser properties (no PII)
const getVisitorId = () => {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return "v_" + Math.abs(hash).toString(36);
};

// Track a profile view
export const trackProfileView = async (profileId) => {
  try {
    await supabase.from("profile_views").insert({
      profile_id: profileId,
      visitor_id: getVisitorId(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  } catch {
    // Silent fail - analytics should never break the app
  }
};

// Track a link click
export const trackLinkClick = async (linkId, profileId) => {
  try {
    await supabase.from("link_clicks").insert({
      link_id: linkId,
      profile_id: profileId,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  } catch {
    // Silent fail
  }
};

// Fetch profile view stats for dashboard
export const getProfileViewStats = async (profileId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("profile_views")
    .select("viewed_at, visitor_id")
    .eq("profile_id", profileId)
    .gte("viewed_at", since.toISOString())
    .order("viewed_at", { ascending: true });

  if (error) throw error;

  // Aggregate by day
  const dailyViews = {};
  const uniqueVisitors = new Set();

  (data || []).forEach((row) => {
    const day = row.viewed_at.split("T")[0];
    dailyViews[day] = (dailyViews[day] || 0) + 1;
    if (row.visitor_id) uniqueVisitors.add(row.visitor_id);
  });

  return {
    totalViews: data?.length || 0,
    uniqueVisitors: uniqueVisitors.size,
    dailyViews,
  };
};

// Fetch link click stats for dashboard
export const getLinkClickStats = async (profileId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("link_clicks")
    .select("link_id, clicked_at")
    .eq("profile_id", profileId)
    .gte("clicked_at", since.toISOString())
    .order("clicked_at", { ascending: true });

  if (error) throw error;

  // Aggregate by link
  const clicksByLink = {};
  const dailyClicks = {};

  (data || []).forEach((row) => {
    clicksByLink[row.link_id] = (clicksByLink[row.link_id] || 0) + 1;
    const day = row.clicked_at.split("T")[0];
    dailyClicks[day] = (dailyClicks[day] || 0) + 1;
  });

  return {
    totalClicks: data?.length || 0,
    clicksByLink,
    dailyClicks,
  };
};
