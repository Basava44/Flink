import { useNavigate } from "react-router-dom";
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
  ExternalLink,
  Send,
  BookOpen,
  Music,
  Settings,
} from "lucide-react";

const PLATFORM_META = {
  email: { icon: Mail, label: "Email", color: "from-blue-500 to-blue-600" },
  phone: { icon: Phone, label: "Phone", color: "from-green-500 to-green-600" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "from-emerald-500 to-emerald-600" },
  instagram: { icon: Instagram, label: "Instagram", color: "from-pink-500 to-rose-500" },
  twitter: { icon: Twitter, label: "Twitter", color: "from-sky-400 to-blue-500" },
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

const formatUrlForClick = (url, platform) => {
  if (platform === "email") {
    return `mailto:${url.replace(/^mailto:/, "").trim()}`;
  }
  if (platform === "phone") {
    return url.startsWith("tel:") ? url : `tel:${url}`;
  }
  if (platform === "whatsapp") {
    if (url.includes("wa.me/") || url.includes("whatsapp.com")) {
      return url.startsWith("http") ? url : `https://${url}`;
    }
    return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
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

// Group consecutive same-platform links together
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

const SocialLinksSection = ({ socialLinks, profileDetails }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  if (!socialLinks || socialLinks.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl border ${
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}>
        <p className={`text-sm mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          No social links yet
        </p>
        <button
          onClick={() => navigate("/settings")}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
            isDark ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <Settings className="w-3 h-3" />
          Add links
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Your links
        </h2>
        <button
          onClick={() => navigate("/settings")}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200 active:scale-95 ${
            isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Edit
        </button>
      </div>

      <div className="space-y-2">
        {groupLinksByPlatform(socialLinks).map((group, gi) => (
          <div key={gi} className={group.length > 1 ? "grid grid-cols-2 gap-2" : ""}>
            {group.map((link, li) => {
              const meta = PLATFORM_META[link.platform] || {
                icon: ExternalLink,
                label: link.platform,
                color: "from-zinc-500 to-zinc-600",
              };
              const Icon = meta.icon;
              const clickUrl = formatUrlForClick(link.url, link.platform);
              const isInternal = ["email", "phone", "whatsapp", "telegram"].includes(link.platform);

              return (
                <a
                  key={link.id || `${gi}-${li}`}
                  href={clickUrl}
                  target={isInternal ? "_self" : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  className={`group flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all duration-200 active:scale-[0.98] hover:scale-[1.01] hover:shadow-lg ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                      : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`block font-medium text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                      {meta.label}
                    </span>
                    <span className={`block text-xs truncate ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                      {link.url.replace(/^(mailto:|tel:)/, "").replace(/^https?:\/\//, "")}
                    </span>
                  </div>

                  <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`} />
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksSection;
