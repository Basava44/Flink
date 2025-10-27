import React from "react";
import { useTheme } from "../hooks/useTheme";
import {
  Mail,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  MessageCircle,
  Gamepad2,
  Link,
  Lock,
  Globe,
  ExternalLink,
  Send,
  BookOpen,
  Music,
} from "lucide-react";

const SocialLinksSection = ({ socialLinks, profileDetails }) => {
  const { isDark } = useTheme();

  // Helper function to get social media icon and color
  const getSocialIcon = (platform) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      whatsapp: <MessageCircle className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      snapchat: <MessageCircle className="w-4 h-4" />,
      discord: <MessageCircle className="w-4 h-4" />,
      twitch: <Gamepad2 className="w-4 h-4" />,
      telegram: <Send className="w-4 h-4" />,
      reddit: <MessageCircle className="w-4 h-4" />,
      spotify: <Music className="w-4 h-4" />,
      medium: <BookOpen className="w-4 h-4" />,
      threads: <Twitter className="w-4 h-4" />,
    };
    return icons[platform] || <Link className="w-4 h-4" />;
  };

  // Helper function to get platform-specific colors
  const getPlatformColors = (platform) => {
    const colors = {
      email: {
        bg: isDark
          ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
        border: isDark ? "border-blue-400/20" : "border-blue-200",
        icon: isDark ? "text-blue-300" : "text-blue-600",
        hover: isDark
          ? "hover:from-blue-500/15 hover:to-blue-600/10"
          : "hover:from-blue-100/90 hover:to-blue-200/80",
        shadow: isDark ? "shadow-blue-500/10" : "shadow-blue-200/30",
      },
      phone: {
        bg: isDark
          ? "bg-gradient-to-br from-green-500/10 to-green-600/5"
          : "bg-gradient-to-br from-green-50/80 to-green-100/60",
        border: isDark ? "border-green-400/20" : "border-green-200",
        icon: isDark ? "text-green-300" : "text-green-600",
        hover: isDark
          ? "hover:from-green-500/15 hover:to-green-600/10"
          : "hover:from-green-100/90 hover:to-green-200/80",
        shadow: isDark ? "shadow-green-500/10" : "shadow-green-200/30",
      },
      whatsapp: {
        bg: isDark
          ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"
          : "bg-gradient-to-br from-emerald-50/80 to-emerald-100/60",
        border: isDark ? "border-emerald-400/20" : "border-emerald-200",
        icon: isDark ? "text-emerald-300" : "text-emerald-600",
        hover: isDark
          ? "hover:from-emerald-500/15 hover:to-emerald-600/10"
          : "hover:from-emerald-100/90 hover:to-emerald-200/80",
        shadow: isDark ? "shadow-emerald-500/10" : "shadow-emerald-200/30",
      },
      instagram: {
        bg: isDark
          ? "bg-gradient-to-br from-pink-500/10 to-rose-500/5"
          : "bg-gradient-to-br from-pink-50/80 to-rose-100/60",
        border: isDark ? "border-pink-400/20" : "border-pink-200",
        icon: isDark ? "text-pink-300" : "text-pink-600",
        hover: isDark
          ? "hover:from-pink-500/15 hover:to-rose-500/10"
          : "hover:from-pink-100/90 hover:to-rose-200/80",
        shadow: isDark ? "shadow-pink-500/10" : "shadow-pink-200/30",
      },
      twitter: {
        bg: isDark
          ? "bg-gradient-to-br from-sky-500/10 to-cyan-500/5"
          : "bg-gradient-to-br from-sky-50/80 to-cyan-100/60",
        border: isDark ? "border-sky-400/20" : "border-sky-200",
        icon: isDark ? "text-sky-300" : "text-sky-600",
        hover: isDark
          ? "hover:from-sky-500/15 hover:to-cyan-500/10"
          : "hover:from-sky-100/90 hover:to-cyan-200/80",
        shadow: isDark ? "shadow-sky-500/10" : "shadow-sky-200/30",
      },
      linkedin: {
        bg: isDark
          ? "bg-gradient-to-br from-blue-600/10 to-blue-700/5"
          : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
        border: isDark ? "border-blue-400/20" : "border-blue-200",
        icon: isDark ? "text-blue-300" : "text-blue-700",
        hover: isDark
          ? "hover:from-blue-600/15 hover:to-blue-700/10"
          : "hover:from-blue-100/90 hover:to-blue-200/80",
        shadow: isDark ? "shadow-blue-600/10" : "shadow-blue-200/30",
      },
      github: {
        bg: isDark
          ? "bg-gradient-to-br from-gray-600/10 to-gray-700/5"
          : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
        border: isDark ? "border-gray-400/20" : "border-gray-200",
        icon: isDark ? "text-gray-300" : "text-gray-700",
        hover: isDark
          ? "hover:from-gray-600/15 hover:to-gray-700/10"
          : "hover:from-gray-100/90 hover:to-gray-200/80",
        shadow: isDark ? "shadow-gray-600/10" : "shadow-gray-200/30",
      },
      youtube: {
        bg: isDark
          ? "bg-gradient-to-br from-red-500/10 to-red-600/5"
          : "bg-gradient-to-br from-red-50/80 to-red-100/60",
        border: isDark ? "border-red-400/20" : "border-red-200",
        icon: isDark ? "text-red-300" : "text-red-600",
        hover: isDark
          ? "hover:from-red-500/15 hover:to-red-600/10"
          : "hover:from-red-100/90 hover:to-red-200/80",
        shadow: isDark ? "shadow-red-500/10" : "shadow-red-200/30",
      },
      facebook: {
        bg: isDark
          ? "bg-gradient-to-br from-blue-700/10 to-blue-800/5"
          : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
        border: isDark ? "border-blue-500/20" : "border-blue-200",
        icon: isDark ? "text-blue-300" : "text-blue-700",
        hover: isDark
          ? "hover:from-blue-700/15 hover:to-blue-800/10"
          : "hover:from-blue-100/90 hover:to-blue-200/80",
        shadow: isDark ? "shadow-blue-700/10" : "shadow-blue-200/30",
      },
      snapchat: {
        bg: isDark
          ? "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
          : "bg-gradient-to-br from-yellow-50/80 to-yellow-100/60",
        border: isDark ? "border-yellow-400/20" : "border-yellow-200",
        icon: isDark ? "text-yellow-300" : "text-yellow-600",
        hover: isDark
          ? "hover:from-yellow-500/15 hover:to-yellow-600/10"
          : "hover:from-yellow-100/90 hover:to-yellow-200/80",
        shadow: isDark ? "shadow-yellow-500/10" : "shadow-yellow-200/30",
      },
      discord: {
        bg: isDark
          ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5"
          : "bg-gradient-to-br from-indigo-50/80 to-indigo-100/60",
        border: isDark ? "border-indigo-400/20" : "border-indigo-200",
        icon: isDark ? "text-indigo-300" : "text-indigo-600",
        hover: isDark
          ? "hover:from-indigo-500/15 hover:to-indigo-600/10"
          : "hover:from-indigo-100/90 hover:to-indigo-200/80",
        shadow: isDark ? "shadow-indigo-500/10" : "shadow-indigo-200/30",
      },
      twitch: {
        bg: isDark
          ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          : "bg-gradient-to-br from-purple-50/80 to-purple-100/60",
        border: isDark ? "border-purple-400/20" : "border-purple-200",
        icon: isDark ? "text-purple-300" : "text-purple-600",
        hover: isDark
          ? "hover:from-purple-500/15 hover:to-purple-600/10"
          : "hover:from-purple-100/90 hover:to-purple-200/80",
        shadow: isDark ? "shadow-purple-500/10" : "shadow-purple-200/30",
      },
      telegram: {
        bg: isDark
          ? "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"
          : "bg-gradient-to-br from-cyan-50/80 to-cyan-100/60",
        border: isDark ? "border-cyan-400/20" : "border-cyan-200",
        icon: isDark ? "text-cyan-300" : "text-cyan-600",
        hover: isDark
          ? "hover:from-cyan-500/15 hover:to-cyan-600/10"
          : "hover:from-cyan-100/90 hover:to-cyan-200/80",
        shadow: isDark ? "shadow-cyan-500/10" : "shadow-cyan-200/30",
      },
      reddit: {
        bg: isDark
          ? "bg-gradient-to-br from-orange-500/10 to-orange-600/5"
          : "bg-gradient-to-br from-orange-50/80 to-orange-100/60",
        border: isDark ? "border-orange-400/20" : "border-orange-200",
        icon: isDark ? "text-orange-300" : "text-orange-600",
        hover: isDark
          ? "hover:from-orange-500/15 hover:to-orange-600/10"
          : "hover:from-orange-100/90 hover:to-orange-200/80",
        shadow: isDark ? "shadow-orange-500/10" : "shadow-orange-200/30",
      },
      spotify: {
        bg: isDark
          ? "bg-gradient-to-br from-green-600/10 to-green-700/5"
          : "bg-gradient-to-br from-green-50/80 to-green-100/60",
        border: isDark ? "border-green-500/20" : "border-green-300",
        icon: isDark ? "text-green-300" : "text-green-600",
        hover: isDark
          ? "hover:from-green-600/15 hover:to-green-700/10"
          : "hover:from-green-100/90 hover:to-green-200/80",
        shadow: isDark ? "shadow-green-600/10" : "shadow-green-300/30",
      },
      medium: {
        bg: isDark
          ? "bg-gradient-to-br from-gray-700/10 to-gray-800/5"
          : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
        border: isDark ? "border-gray-500/20" : "border-gray-300",
        icon: isDark ? "text-gray-300" : "text-gray-700",
        hover: isDark
          ? "hover:from-gray-700/15 hover:to-gray-800/10"
          : "hover:from-gray-100/90 hover:to-gray-200/80",
        shadow: isDark ? "shadow-gray-700/10" : "shadow-gray-300/30",
      },
      threads: {
        bg: isDark
          ? "bg-gradient-to-br from-slate-500/10 to-slate-600/5"
          : "bg-gradient-to-br from-slate-50/80 to-slate-100/60",
        border: isDark ? "border-slate-400/20" : "border-slate-200",
        icon: isDark ? "text-slate-300" : "text-slate-600",
        hover: isDark
          ? "hover:from-slate-500/15 hover:to-slate-600/10"
          : "hover:from-slate-100/90 hover:to-slate-200/80",
        shadow: isDark ? "shadow-slate-500/10" : "shadow-slate-200/30",
      },
    };
    return (
      colors[platform] || {
        bg: isDark
          ? "bg-gradient-to-br from-gray-500/10 to-gray-600/5"
          : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
        border: isDark ? "border-gray-400/20" : "border-gray-200",
        icon: isDark ? "text-gray-300" : "text-gray-600",
        hover: isDark
          ? "hover:from-gray-500/15 hover:to-gray-600/10"
          : "hover:from-gray-100/90 hover:to-gray-200/80",
        shadow: isDark ? "shadow-gray-500/10" : "shadow-gray-200/30",
      }
    );
  };

  // Helper function to get social media name
  const getSocialName = (platform) => {
    const names = {
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      github: "GitHub",
      youtube: "YouTube",
      facebook: "Facebook",
      snapchat: "Snapchat",
      discord: "Discord",
      twitch: "Twitch",
      telegram: "Telegram",
      reddit: "Reddit",
      spotify: "Spotify",
      medium: "Medium",
      threads: "Threads",
    };
    return names[platform] || platform;
  };

  // Helper function to format URL for display
  const formatUrlForDisplay = (url, platform) => {
    if (platform === "email") {
      return url.replace("mailto:", "");
    } else if (platform === "phone") {
      return url.replace("tel:", "");
    } else {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname;
      } catch {
        return url;
      }
    }
  };

  // Helper function to format URL for clicking
  const formatUrlForClick = (url, platform) => {
    if (platform === "email") {
      // Ensure email URL is properly formatted
      let cleanEmail = url;
      if (url.startsWith("mailto:")) {
        cleanEmail = url.replace("mailto:", "");
      }
      // Remove any extra characters and ensure it's a valid email
      cleanEmail = cleanEmail.trim();
      return `mailto:${cleanEmail}`;
    } else if (platform === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`;
    } else if (platform === "whatsapp") {
      // Handle whatsapp links
      if (url.includes("wa.me/") || url.includes("whatsapp.com")) {
        return url.startsWith("http") ? url : `https://${url}`;
      }
      // Just phone number
      return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
    } else {
      // If it's already a full URL, return as is
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      // Handle social media usernames and URLs
      const socialUrls = {
        whatsapp: (username) => {
          // Handle whatsapp links
          if (username.includes("wa.me/") || username.includes("whatsapp.com")) {
            return username.startsWith("http") ? username : `https://${username}`;
          }
          // Just phone number
          return `https://wa.me/${username.replace(/[^0-9]/g, "")}`;
        },
        telegram: (username) =>
          username.includes("t.me/") || username.includes("telegram.me/")
            ? `https://${username}`
            : `https://t.me/${username.replace("@", "")}`,
        instagram: (username) =>
          `https://instagram.com/${username.replace("@", "")}`,
        twitter: (username) =>
          `https://twitter.com/${username.replace("@", "")}`,
        linkedin: (username) =>
          username.includes("linkedin.com")
            ? `https://${username}`
            : `https://linkedin.com/in/${username}`,
        github: (username) =>
          username.includes("github.com")
            ? `https://${username}`
            : `https://github.com/${username}`,
        youtube: (username) =>
          username.includes("youtube.com")
            ? `https://${username}`
            : `https://youtube.com/@${username.replace("@", "")}`,
        facebook: (username) =>
          username.includes("facebook.com")
            ? `https://${username}`
            : `https://facebook.com/${username}`,
        snapchat: (username) =>
          `https://snapchat.com/add/${username.replace("@", "")}`,
        discord: (username) => `https://discord.com/users/${username}`,
        twitch: (username) =>
          username.includes("twitch.tv")
            ? `https://${username}`
            : `https://twitch.tv/${username}`,
      };

      if (socialUrls[platform]) {
        return socialUrls[platform](url);
      }

      // Fallback: add https://
      return `https://${url}`;
    }
  };

  if (!socialLinks || socialLinks.length === 0) return null;

  // Deduplicate email social links - keep only the first one
  const deduplicatedLinks = socialLinks.reduce((acc, link) => {
    if (link.platform === "email") {
      // Check if we already have an email link
      const hasEmail = acc.some(
        (existingLink) => existingLink.platform === "email"
      );
      if (!hasEmail) {
        acc.push(link);
      }
    } else {
      acc.push(link);
    }
    return acc;
  }, []);

  return (
    <div
      className={`p-6 rounded-2xl ${
        isDark
          ? "bg-slate-800/60 border border-slate-700/60"
          : "bg-white/90 border border-gray-200/60"
      } backdrop-blur-sm shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Social Links
        </h2>
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm px-3 py-1.5 rounded-full font-medium ${
              isDark
                ? "bg-slate-700/80 text-slate-200 border border-slate-600"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {deduplicatedLinks.length} link
            {deduplicatedLinks.length !== 1 ? "s" : ""}
          </span>
          {/* Global privacy indicator */}
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              profileDetails?.private
                ? isDark
                  ? "bg-orange-900/30 text-orange-400 border border-orange-800"
                  : "bg-orange-100 text-orange-800 border border-orange-200"
                : isDark
                ? "bg-green-900/30 text-green-400 border border-green-800"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {profileDetails?.private ? (
              <>
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {deduplicatedLinks.map((link, index) => {
          const clickUrl = formatUrlForClick(link.url, link.platform);
          const colors = getPlatformColors(link.platform);

          const handleClick = (e) => {
            if (link.platform === "email") {
              e.preventDefault();

              // Try multiple methods to open email
              try {
                // Method 1: Direct window.location
                window.location.href = clickUrl;
              } catch (error) {
                console.error("Method 1 failed:", error);
                try {
                  // Method 2: Create and click a temporary link
                  const tempLink = document.createElement("a");
                  tempLink.href = clickUrl;
                  tempLink.click();
                } catch (error2) {
                  console.error("Method 2 failed:", error2);
                  // Method 3: Copy to clipboard as fallback
                  navigator.clipboard.writeText(
                    link.url.replace("mailto:", "")
                  );
                  alert(
                    "Email copied to clipboard: " +
                      link.url.replace("mailto:", "")
                  );
                }
              }
            }
          };

          return (
            <a
              key={index}
              href={clickUrl}
              onClick={handleClick}
              target={
                link.platform === "email" || link.platform === "phone" || link.platform === "whatsapp" || link.platform === "telegram"
                  ? "_self"
                  : "_blank"
              }
              rel={
                link.platform === "email" || link.platform === "phone" || link.platform === "whatsapp" || link.platform === "telegram"
                  ? ""
                  : "noopener noreferrer"
              }
              className={`group p-2 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${colors.bg} ${colors.border} ${colors.hover} ${colors.shadow} shadow-lg`}
              title={`${getSocialName(link.platform)} - ${formatUrlForDisplay(
                link.url,
                link.platform
              )}`}
            >
              {/* Platform icon */}
              <div className={`${colors.icon} mb-2 flex justify-center`}>
                {getSocialIcon(link.platform)}
              </div>

              {/* Platform name */}
              <div className="text-center">
                <p
                  className={`text-xs font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {getSocialName(link.platform)}
                </p>
                <p
                  className={`text-xs truncate mt-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {link.url.replace(/^(mailto:|tel:)/, "")}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinksSection;
