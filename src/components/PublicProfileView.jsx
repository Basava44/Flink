import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  MessageCircle,
  Gamepad2,
  ExternalLink,
  Send,
  BookOpen,
  Music,
  Copy,
  Check,
  Share2,
  Link2,
  Star,
  PhoneCall,
  Download,
} from "lucide-react";

const PLATFORM_META = {
  email: { icon: Mail, label: "Email", color: "from-blue-500 to-blue-600" },
  phone: { icon: Phone, label: "Phone", color: "from-green-500 to-green-600" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "from-emerald-500 to-emerald-600" },
  instagram: { icon: Instagram, label: "Instagram", color: "from-pink-500 to-rose-500" },
  twitter: { icon: Twitter, label: "Twitter/X", color: "from-sky-400 to-blue-500" },
  linkedin: { icon: Linkedin, label: "LinkedIn", color: "from-blue-600 to-blue-700" },
  github: { icon: Github, label: "GitHub", color: "from-gray-700 to-gray-900" },
  youtube: { icon: Youtube, label: "YouTube", color: "from-red-500 to-red-600" },
  facebook: { icon: Facebook, label: "Facebook", color: "from-blue-600 to-blue-800" },
  snapchat: { icon: MessageCircle, label: "Snapchat", color: "from-yellow-400 to-yellow-500" },
  discord: { icon: MessageCircle, label: "Discord", color: "from-indigo-500 to-indigo-600" },
  twitch: { icon: Gamepad2, label: "Twitch", color: "from-purple-500 to-purple-600" },
  telegram: { icon: Send, label: "Telegram", color: "from-cyan-400 to-cyan-500" },
  reddit: { icon: MessageCircle, label: "Reddit", color: "from-orange-500 to-orange-600" },
  spotify: { icon: Music, label: "Spotify", color: "from-green-500 to-green-600" },
  medium: { icon: BookOpen, label: "Medium", color: "from-gray-700 to-gray-800" },
  threads: { icon: Twitter, label: "Threads", color: "from-gray-800 to-black" },
};

const CONTACT_PLATFORMS = new Set(["email", "phone", "whatsapp", "telegram"]);
const FEATURED_PLATFORMS = new Set(["instagram", "twitter", "linkedin", "youtube", "facebook", "threads"]);

const formatUrlForClick = (url, platform) => {
  if (platform === "email") return `mailto:${url.replace(/^mailto:/, "")}`;
  if (platform === "phone") return url.startsWith("tel:") ? url : `tel:${url}`;
  if (platform === "whatsapp") {
    if (url.includes("wa.me/") || url.includes("whatsapp.com"))
      return url.startsWith("http") ? url : `https://${url}`;
    return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const builders = {
    telegram: (u) => u.includes("t.me/") ? `https://${u}` : `https://t.me/${u.replace("@", "")}`,
    instagram: (u) => `https://instagram.com/${u.replace("@", "")}`,
    twitter: (u) => `https://twitter.com/${u.replace("@", "")}`,
    linkedin: (u) => u.includes("linkedin.com") ? `https://${u}` : `https://linkedin.com/in/${u}`,
    github: (u) => u.includes("github.com") ? `https://${u}` : `https://github.com/${u}`,
    youtube: (u) => u.includes("youtube.com") ? `https://${u}` : `https://youtube.com/@${u.replace("@", "")}`,
    facebook: (u) => u.includes("facebook.com") ? `https://${u}` : `https://facebook.com/${u}`,
    snapchat: (u) => `https://snapchat.com/add/${u.replace("@", "")}`,
    discord: (u) => `https://discord.com/users/${u}`,
    twitch: (u) => u.includes("twitch.tv") ? `https://${u}` : `https://twitch.tv/${u}`,
  };
  return builders[platform] ? builders[platform](url) : `https://${url}`;
};

const formatDisplayUrl = (url, platform) => {
  const clean = url.replace(/^(mailto:|tel:)/, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

  // Extract username from full URLs
  const extractUsername = (str, domain) => {
    const match = str.match(new RegExp(`${domain}/(?:in/|@)?([^/?#]+)`));
    return match ? match[1] : str.replace(new RegExp(`.*${domain}/?`), "");
  };

  if (["instagram", "twitter", "telegram", "threads"].includes(platform)) {
    const username = clean.includes("/") ? clean.split("/").filter(Boolean).pop() : clean;
    return `@${username.replace(/^@/, "")}`;
  }
  if (platform === "linkedin") {
    const username = extractUsername(clean, "linkedin\\.com");
    return username || clean;
  }
  if (platform === "github") {
    const username = clean.includes("github.com") ? clean.split("github.com/")[1]?.split("/")[0] : clean;
    return username || clean;
  }
  if (platform === "youtube") {
    const username = clean.includes("youtube.com") ? clean.split("youtube.com/")[1]?.replace(/^@/, "") : clean;
    return username ? `@${username.replace(/^@/, "")}` : clean;
  }
  if (platform === "facebook") {
    const username = clean.includes("facebook.com") ? clean.split("facebook.com/")[1]?.split("/")[0] : clean;
    return username || clean;
  }
  if (platform === "reddit") {
    const username = clean.includes("reddit.com") ? clean.split("/").filter(Boolean).pop() : clean;
    return username.startsWith("u/") ? username : `u/${username}`;
  }
  return clean;
};

// Categorize links into sections, keeping same platforms grouped
const categorizeSocialLinks = (links) => {
  const contact = [];
  const featured = [];
  const elsewhere = [];

  // Track which section each platform was first placed in
  const platformSection = {};

  links.forEach((link) => {
    if (CONTACT_PLATFORMS.has(link.platform)) {
      contact.push(link);
      return;
    }

    // If this platform already has a section, put it there
    if (platformSection[link.platform]) {
      platformSection[link.platform].push(link);
      return;
    }

    // New platform - decide where it goes
    if (FEATURED_PLATFORMS.has(link.platform) && featured.length < 4) {
      featured.push(link);
      platformSection[link.platform] = featured;
    } else {
      elsewhere.push(link);
      platformSection[link.platform] = elsewhere;
    }
  });

  return { contact, featured, elsewhere };
};

// Group consecutive same-platform links together within a section
const groupLinksByPlatform = (links) => {
  const groups = [];
  let i = 0;
  while (i < links.length) {
    const platform = links[i].platform;
    const group = [links[i]];
    while (i + 1 < links.length && links[i + 1].platform === platform) {
      i++;
      group.push(links[i]);
    }
    groups.push(group);
    i++;
  }
  return groups;
};

// Generate vCard string
const generateVCard = (profileData, socialLinks) => {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profileData.name || ""}`,
  ];

  if (profileData.website) {
    const url = profileData.website.startsWith("http") ? profileData.website : `https://${profileData.website}`;
    lines.push(`URL:${url}`);
  }

  socialLinks.forEach((link) => {
    if (link.platform === "email") {
      const email = link.url.replace(/^mailto:/, "").trim();
      lines.push(`EMAIL:${email}`);
    }
    if (link.platform === "phone") {
      const phone = link.url.replace(/^tel:/, "").trim();
      lines.push(`TEL:${phone}`);
    }
  });

  if (profileData.profile_url) {
    lines.push(`PHOTO;VALUE=uri:${profileData.profile_url}`);
  }

  if (profileData.bio) {
    lines.push(`NOTE:${profileData.bio}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
};

const LinkCard = ({ link, isDark, index = 0 }) => {
  const meta = PLATFORM_META[link.platform] || {
    icon: ExternalLink,
    label: link.platform,
    color: "from-zinc-500 to-zinc-600",
  };
  const Icon = meta.icon;
  const clickUrl = formatUrlForClick(link.url, link.platform);
  const isInternal = ["email", "phone", "whatsapp", "telegram"].includes(link.platform);
  const displayUrl = formatDisplayUrl(link.url, link.platform);

  return (
    <a
      href={clickUrl}
      target={isInternal ? "_self" : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      className={`group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:scale-[1.01] animate-fade-in-up ${
        isDark
          ? "hover:bg-zinc-800/60"
          : "hover:bg-zinc-50"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-[18px] h-[18px] text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <span className={`block font-semibold text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
          {meta.label}
        </span>
        <span className={`block text-xs truncate mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          {displayUrl}
        </span>
      </div>
    </a>
  );
};

const LinkGrid = ({ links, isDark, indexOffset = 0 }) => {
  if (links.length === 0) return null;
  if (links.length === 1) return <LinkCard link={links[0]} isDark={isDark} index={indexOffset} />;

  const isOdd = links.length % 2 !== 0;
  const gridLinks = isOdd ? links.slice(0, -1) : links;
  const lastLink = isOdd ? links[links.length - 1] : null;

  return (
    <>
      <div className="grid grid-cols-2">
        {gridLinks.map((link, i) => (
          <LinkCard key={link.id} link={link} isDark={isDark} index={indexOffset + i} />
        ))}
      </div>
      {lastLink && <LinkCard link={lastLink} isDark={isDark} index={indexOffset + gridLinks.length} />}
    </>
  );
};

const Section = ({ icon: SectionIcon, title, subtitle, children, isDark }) => {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      isDark ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white border-zinc-200/60 shadow-sm"
    }`}>
      {/* Section header */}
      <div className={`px-5 pt-4 pb-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <SectionIcon className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
          <h3 className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
            {title}
          </h3>
        </div>
        <span className={`text-[11px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          {subtitle}
        </span>
      </div>

      {/* Links */}
      <div className="px-1.5 pb-1.5">
        {children}
      </div>
    </div>
  );
};

const PublicProfileView = ({ handle, isPreview = false }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!handle) {
        setError("No profile handle provided");
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from("flink_profiles")
          .select("*")
          .eq("handle", handle.toLowerCase())
          .single();

        if (profileError || !profile) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("name, created_at, profile_url")
          .eq("id", profile.user_id)
          .single();

        const { data: links } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", profile.user_id)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: true });

        setProfileData({
          ...profile,
          name: userData?.name,
          created_at: userData?.created_at,
          profile_url: profile.profile_url || userData?.profile_url,
        });
        setSocialLinks(links || []);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [handle]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${handle}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${handle}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profileData.name} on Flink`, url });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveContact = () => {
    if (!profileData) return;
    const vcard = generateVCard(profileData, socialLinks);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profileData.name || profileData.handle}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
        <div className="max-w-md mx-auto px-5 pt-16 pb-8">
          <div className="flex flex-col items-center animate-pulse">
            <div className={`w-28 h-28 rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className={`h-6 w-40 mt-5 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className={`h-4 w-24 mt-2 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className={`h-4 w-56 mt-3 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className="w-full mt-10 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-20 rounded-2xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !profileData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
        <div className="text-center px-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
            <User className="w-10 h-10 opacity-40" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className={`mb-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            @{handle} doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95 ${
              isDark
                ? "bg-white text-zinc-900 hover:bg-zinc-100"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  const initial = profileData.name?.charAt(0)?.toUpperCase() || "?";
  const { contact, featured, elsewhere } = categorizeSocialLinks(socialLinks);
  const hasContact = contact.length > 0;

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
      {/* Subtle gradient header */}
      <div className={`absolute inset-x-0 top-0 h-64 ${
        isDark
          ? "bg-gradient-to-b from-zinc-900 to-transparent"
          : "bg-gradient-to-b from-zinc-100 to-transparent"
      }`} />

      {/* Preview banner */}
      {isPreview && (
        <div className={`relative z-10 border-b ${isDark ? "bg-zinc-900/90 border-zinc-800 backdrop-blur-sm" : "bg-white/90 border-zinc-200 backdrop-blur-sm"}`}>
          <div className="max-w-md mx-auto px-5 py-2.5 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Preview mode - this is how others see your profile
            </span>
            <button
              onClick={() => navigate(`/${handle}`, { replace: true })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark
                  ? "bg-white text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              Exit preview
            </button>
          </div>
        </div>
      )}

      {/* Back button - only for logged in users viewing others */}
      {user && !isPreview && (
        <div className="relative max-w-md mx-auto px-5 pt-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 -ml-2 rounded-xl transition-all duration-200 active:scale-95 ${
              isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="relative max-w-md mx-auto px-5 pt-10 pb-16">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with gradient ring */}
          <div className="relative mb-5">
            <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-75 blur-sm" />
            <div className={`relative w-28 h-28 rounded-full ${isDark ? "ring-4 ring-zinc-950" : "ring-4 ring-zinc-100"}`}>
              {profileData.profile_url ? (
                <img
                  src={profileData.profile_url}
                  alt={profileData.name}
                  className="w-28 h-28 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-28 h-28 rounded-full items-center justify-center text-3xl font-bold ${
                  profileData.profile_url ? "hidden" : "flex"
                } ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-600"}`}
              >
                {initial}
              </div>
            </div>
          </div>

          {/* Name */}
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            {profileData.name}
          </h1>

          {/* Handle */}
          <p className={`text-sm mt-0.5 font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            @{profileData.handle}
          </p>

          {/* Bio */}
          {profileData.bio && (
            <p className={`mt-3 text-sm leading-relaxed max-w-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {profileData.bio}
            </p>
          )}

          {/* Location & Website pills */}
          {(profileData.location || profileData.website) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {profileData.location && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-white text-zinc-500 shadow-sm"
                }`}>
                  <MapPin className="w-3 h-3" />
                  {profileData.location}
                </span>
              )}
              {profileData.website && (
                <a
                  href={profileData.website.startsWith("http") ? profileData.website : `https://${profileData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                    isDark
                      ? "bg-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                      : "bg-white text-zinc-500 hover:text-zinc-700 shadow-sm"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {profileData.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 mt-6 w-full max-w-xs">
            {hasContact && (
              <button
                onClick={handleSaveContact}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-purple-500/20"
              >
                <Download className="w-4 h-4" />
                Save contact
              </button>
            )}
            <button
              onClick={handleShare}
              className={`${hasContact ? "" : "flex-1"} inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] ${
                isDark
                  ? "bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700/50"
                  : "bg-white text-zinc-600 hover:text-zinc-800 border border-zinc-200 shadow-sm"
              }`}
            >
              <Share2 className="w-4 h-4" />
              Share profile
            </button>
          </div>
        </div>

        {/* Categorized sections */}
        <div className="mt-8 space-y-3">
          {/* Featured */}
          {featured.length > 0 && (
            <Section
              icon={Star}
              title="Featured"
              subtitle={`${featured.length} ${featured.length === 1 ? "link" : "links"}`}
              isDark={isDark}
            >
              <LinkGrid links={featured} isDark={isDark} indexOffset={0} />
            </Section>
          )}

          {/* Contact */}
          {contact.length > 0 && (
            <Section
              icon={PhoneCall}
              title="Contact"
              subtitle={`${contact.length} ${contact.length === 1 ? "link" : "links"}`}
              isDark={isDark}
            >
              <LinkGrid links={contact} isDark={isDark} indexOffset={featured.length} />
            </Section>
          )}

          {/* Elsewhere */}
          {elsewhere.length > 0 && (
            <Section
              icon={Globe}
              title="Elsewhere"
              subtitle={`${elsewhere.length} ${elsewhere.length === 1 ? "link" : "links"}`}
              isDark={isDark}
            >
              <LinkGrid links={elsewhere} isDark={isDark} indexOffset={featured.length + contact.length} />
            </Section>
          )}

          {/* Empty state */}
          {socialLinks.length === 0 && (
            <div className={`text-center py-12 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              <p className="text-sm">No links added yet.</p>
            </div>
          )}
        </div>

        {/* Copy link - subtle */}
        <button
          onClick={handleCopyLink}
          className={`w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
            copied
              ? "text-green-500"
              : isDark
                ? "text-zinc-600 hover:text-zinc-400"
                : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Link copied!" : `${window.location.host}/${handle}`}
        </button>

        {/* Footer */}
        <div className={`mt-10 text-center ${!user ? "pb-16" : ""}`}>
          <div className={`inline-flex items-center gap-1.5 text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            <Link2 className="w-3 h-3" />
            <span>Powered by</span>
            <span className="font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Flink
            </span>
          </div>
        </div>
      </div>

      {/* Sticky CTA for logged-out visitors */}
      {!user && (
        <div className={`fixed bottom-0 inset-x-0 z-20 border-t backdrop-blur-lg ${
          isDark ? "bg-zinc-950/90 border-zinc-800" : "bg-white/90 border-zinc-200"
        }`}>
          <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
            <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Flink</span>
              <span className="ml-1.5">- All your socials. One link.</span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              Get yours
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfileView;
