import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "../lib/supabase";
import { getProfileViewStats, getLinkClickStats } from "../lib/analytics";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  BarChart3,
  Lock,
  ExternalLink,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

// Simple sparkline bar chart
const MiniChart = ({ data, days, isDark }) => {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().split("T")[0]);
  }

  const values = labels.map((day) => data[day] || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px] h-24 w-full">
      {values.map((v, i) => (
        <div
          key={labels[i]}
          className="flex-1 min-w-0 group relative"
          style={{ height: "100%" }}
        >
          <div
            className={`absolute bottom-0 w-full rounded-sm transition-all duration-200 ${
              isDark
                ? "bg-purple-500/80 group-hover:bg-purple-400"
                : "bg-purple-500/70 group-hover:bg-purple-600"
            }`}
            style={{ height: `${Math.max((v / max) * 100, v > 0 ? 4 : 0)}%` }}
          />
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
            isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-700 text-white"
          }`}>
            {v} - {labels[i].slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, isDark }) => (
  <div className={`rounded-xl border p-4 ${
    isDark ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white border-zinc-200/60 shadow-sm"
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
      <span className={`text-xs font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
    </div>
    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{value}</p>
  </div>
);

const TopLinkRow = ({ link, clicks, isDark }) => (
  <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
    isDark ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50"
  }`}>
    <div className="flex items-center gap-2 min-w-0">
      <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
      <span className={`text-sm truncate ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
        {link.label || link.platform}
      </span>
      <span className={`text-xs truncate ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
        {link.url?.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 30)}
      </span>
    </div>
    <span className={`text-sm font-semibold tabular-nums ml-3 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
      {clicks}
    </span>
  </div>
);

function AnalyticsPage() {
  const navigate = useNavigate();
  const { user, userDetails } = useAuth();
  const { isDark } = useTheme();
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [viewStats, setViewStats] = useState(null);
  const [clickStats, setClickStats] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  // Load profile + premium status
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from("flink_profiles")
        .select("id, is_premium")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        setIsPremium(profile.is_premium);
      }
    };

    loadProfile();
  }, [user]);

  // Load analytics data
  useEffect(() => {
    if (!profileId || !isPremium) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [views, clicks, { data: links }] = await Promise.all([
          getProfileViewStats(profileId, period),
          getLinkClickStats(profileId, period),
          supabase
            .from("social_links")
            .select("id, platform, url, label")
            .eq("user_id", user.id),
        ]);

        setViewStats(views);
        setClickStats(clicks);
        setSocialLinks(links || []);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [profileId, isPremium, period, user]);

  // Premium gate
  if (!loading && !isPremium) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
        <div className="max-w-lg mx-auto px-5 pt-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 -ml-2 rounded-xl transition-all duration-200 active:scale-95 ${
              isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center px-6 pt-24">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            isDark ? "bg-zinc-800" : "bg-zinc-200"
          }`}>
            <Lock className={`w-8 h-8 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
          </div>
          <h1 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Analytics is a Premium feature
          </h1>
          <p className={`text-sm text-center max-w-xs mb-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            See who visits your profile, which links get clicked, and track your growth over time.
          </p>
          <button
            onClick={() => navigate("/settings")}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-purple-500/20"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Top links sorted by clicks
  const topLinks = socialLinks
    .map((link) => ({ ...link, clicks: clickStats?.clicksByLink[link.id] || 0 }))
    .filter((l) => l.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
      <div className="max-w-lg mx-auto px-5 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 -ml-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
              Analytics
            </h1>
          </div>

          {/* Period selector */}
          <div className={`flex rounded-lg border p-0.5 ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                  period === opt.value
                    ? isDark
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-900 text-white"
                    : isDark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-20 rounded-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
              ))}
            </div>
            <div className={`h-40 rounded-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard icon={Eye} label="Views" value={viewStats?.totalViews || 0} isDark={isDark} />
              <StatCard icon={Users} label="Unique" value={viewStats?.uniqueVisitors || 0} isDark={isDark} />
              <StatCard icon={MousePointerClick} label="Clicks" value={clickStats?.totalClicks || 0} isDark={isDark} />
            </div>

            {/* Profile views chart */}
            <div className={`rounded-xl border p-4 mb-4 ${
              isDark ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white border-zinc-200/60 shadow-sm"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                <h2 className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Profile views
                </h2>
              </div>
              <MiniChart data={viewStats?.dailyViews || {}} days={period} isDark={isDark} />
            </div>

            {/* Link clicks chart */}
            <div className={`rounded-xl border p-4 mb-4 ${
              isDark ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white border-zinc-200/60 shadow-sm"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                <h2 className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Link clicks
                </h2>
              </div>
              <MiniChart data={clickStats?.dailyClicks || {}} days={period} isDark={isDark} />
            </div>

            {/* Top links */}
            {topLinks.length > 0 && (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white border-zinc-200/60 shadow-sm"
              }`}>
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                    <h2 className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      Top links
                    </h2>
                  </div>
                  <span className={`text-[11px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>clicks</span>
                </div>
                <div className="px-1.5 pb-1.5">
                  {topLinks.map((link) => (
                    <TopLinkRow key={link.id} link={link} clicks={link.clicks} isDark={isDark} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(viewStats?.totalViews || 0) === 0 && (clickStats?.totalClicks || 0) === 0 && (
              <div className={`text-center py-12 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No data yet</p>
                <p className="text-xs mt-1">Share your profile link to start seeing analytics</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
