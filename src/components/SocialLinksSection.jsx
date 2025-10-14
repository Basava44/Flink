import React from 'react';
import { useTheme } from '../hooks/useTheme';
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
  Link 
} from 'lucide-react';

const SocialLinksSection = ({ socialLinks }) => {
  const { isDark } = useTheme();

  // Helper function to get social media icon
  const getSocialIcon = (platform) => {
    const icons = {
      email: <Mail className="w-5 h-5" />,
      phone: <Phone className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      twitter: <Twitter className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      github: <Github className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
      facebook: <Facebook className="w-5 h-5" />,
      snapchat: <MessageCircle className="w-5 h-5" />,
      discord: <MessageCircle className="w-5 h-5" />,
      twitch: <Gamepad2 className="w-5 h-5" />,
    };
    return icons[platform] || <Link className="w-5 h-5" />;
  };

  // Helper function to get social media name
  const getSocialName = (platform) => {
    const names = {
      email: "Email",
      phone: "Phone",
      instagram: "Instagram",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      github: "GitHub",
      youtube: "YouTube",
      facebook: "Facebook",
      snapchat: "Snapchat",
      discord: "Discord",
      twitch: "Twitch",
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

  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-xl shadow-soft ${
        isDark
          ? "bg-slate-800/50 border border-slate-700/50"
          : "bg-white border border-gray-200"
      }`}
    >
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Social Links
      </h2>
      <div className="space-y-3">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
              isDark
                ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getSocialIcon(link.platform)}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {getSocialName(link.platform)}
                </p>
                <p
                  className={`text-sm truncate ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                  title={link.url}
                >
                  {formatUrlForDisplay(link.url, link.platform)}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksSection;
