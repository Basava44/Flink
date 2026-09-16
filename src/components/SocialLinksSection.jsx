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
  Star,
  PhoneCall,
  Globe,
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

const CONTACT_PLATFORMS = new Set(["email", "phone", "whatsapp", "telegram"]);
const FEATURED_PLATFORMS = new Set(["instagram", "twitter", "linkedin", "youtube", "facebook", "threads"]);

const formatUrlForClick = (url, platform) => {
  if (platform === "email") return `mailto:${url.replace(/^mailto:/, "").trim()}`;
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
  if (["instagram", "twitter", "telegram", "threads"].includes(platform)) {
    const username = clean.includes("/") ? clean.split("/").filter(Boolean).pop() : clean;
    return `@${username.replace(/^@/, "")}`;
  }
  if (platform === "github") {
    const username = clean.includes("github.com") ? clean.split("github.com/")[1]?.split("/")[0] : clean;
    return username || clean;
  }
  if (platform === "youtube") {
    const username = clean.includes("youtube.com") ? clean.split("youtube.com/")[1]?.replace(/^@/, "") : clean;
    return username ? `@${username.replace(/^@/, "")}` : clean;
  }
  if (platform === "linkedin") {
    const match = clean.match(/linkedin\.com\/in\/([^/?#]+)/);
    return match ? match[1] : clean;
  }
  return clean;
};

const categorizeSocialLinks = (links) => {
  const contact = [];
  const featured = [];
  const elsewhere = [];
  const platformSection = {};

  links.forEach((link) => {
    if (CONTACT_PLATFORMS.has(link.platform)) {
      contact.push(link);
      return;
    }
    if (platformSection[link.platform]) {
      platformSection[link.platform].push(link);
      return;
    }
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
      className={`group flex items-center gap-2.5 sm:gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:scale-[1.01] ${
        isDark ? "hover:bg-zinc-800/60" : "hover:bg-zinc-50"
      }`}
    >
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <span className={`block font-medium text-[13px] sm:text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
          {meta.label}
        </span>
        <span className={`block text-[11px] sm:text-xs truncate mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
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
      <div className="px-4 sm:px-5 pt-3.5 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SectionIcon className={`w-3.5 h-3.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
          <h3 className={`text-xs sm:text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
            {title}
          </h3>
        </div>
        <span className={`text-[11px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          {subtitle}
        </span>
      </div>
      <div className="px-1.5 pb-1.5">
        {children}
      </div>
    </div>
  );
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

  const { contact, featured, elsewhere } = categorizeSocialLinks(socialLinks);

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

      <div className="space-y-2.5">
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
      </div>
    </div>
  );
};

export default SocialLinksSection;
