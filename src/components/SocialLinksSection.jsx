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

  // Helper function to format URL for clicking
  const formatUrlForClick = (url, platform) => {
    if (platform === "email") {
      // Ensure email URL is properly formatted
      let cleanEmail = url;
      if (url.startsWith('mailto:')) {
        cleanEmail = url.replace('mailto:', '');
      }
      // Remove any extra characters and ensure it's a valid email
      cleanEmail = cleanEmail.trim();
      console.log('Email formatting - Original:', url, 'Clean:', cleanEmail);
      return `mailto:${cleanEmail}`;
    } else if (platform === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`;
    } else {
      // If it's already a full URL, return as is
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      
      // Handle social media usernames and URLs
      const socialUrls = {
        instagram: (username) => `https://instagram.com/${username.replace('@', '')}`,
        twitter: (username) => `https://twitter.com/${username.replace('@', '')}`,
        linkedin: (username) => username.includes('linkedin.com') ? `https://${username}` : `https://linkedin.com/in/${username}`,
        github: (username) => username.includes('github.com') ? `https://${username}` : `https://github.com/${username}`,
        youtube: (username) => username.includes('youtube.com') ? `https://${username}` : `https://youtube.com/@${username.replace('@', '')}`,
        facebook: (username) => username.includes('facebook.com') ? `https://${username}` : `https://facebook.com/${username}`,
        snapchat: (username) => `https://snapchat.com/add/${username.replace('@', '')}`,
        discord: (username) => `https://discord.com/users/${username}`,
        twitch: (username) => username.includes('twitch.tv') ? `https://${username}` : `https://twitch.tv/${username}`,
      };
      
      if (socialUrls[platform]) {
        return socialUrls[platform](url);
      }
      
      // Fallback: add https://
      return `https://${url}`;
    }
  };

  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-xl shadow-soft ${
        isDark
          ? "bg-slate-800 border border-slate-700"
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
        {socialLinks.map((link, index) => {
          const clickUrl = formatUrlForClick(link.url, link.platform);
          
          // Debug logging
          console.log('Social link:', { platform: link.platform, url: link.url, clickUrl });
          
          const handleClick = (e) => {
            if (link.platform === "email") {
              e.preventDefault();
              console.log('Email clicked - Original URL:', link.url);
              console.log('Email clicked - Formatted URL:', clickUrl);
              
              // Try multiple methods to open email
              try {
                // Method 1: Direct window.location
                window.location.href = clickUrl;
              } catch (error) {
                console.error('Method 1 failed:', error);
                try {
                  // Method 2: Create and click a temporary link
                  const tempLink = document.createElement('a');
                  tempLink.href = clickUrl;
                  tempLink.click();
                } catch (error2) {
                  console.error('Method 2 failed:', error2);
                  // Method 3: Copy to clipboard as fallback
                  navigator.clipboard.writeText(link.url.replace('mailto:', ''));
                  alert('Email copied to clipboard: ' + link.url.replace('mailto:', ''));
                }
              }
            }
          };
          
          return (
            <a
              key={index}
              href={clickUrl}
              onClick={handleClick}
              target={link.platform === "email" || link.platform === "phone" ? "_self" : "_blank"}
              rel={link.platform === "email" || link.platform === "phone" ? "" : "noopener noreferrer"}
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
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinksSection;
