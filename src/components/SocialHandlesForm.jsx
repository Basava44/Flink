import React, { useState, useEffect } from 'react';
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
  Send,
  BookOpen,
  Music,
} from 'lucide-react';

const SocialHandlesForm = ({ onNext, onBack, initialData = {}, userEmail = '' }) => {
  const { isDark } = useTheme();
  const [socialLinks, setSocialLinks] = useState({
    email: initialData.email || userEmail || '',
    phone: initialData.phone || '',
    whatsapp: initialData.whatsapp || '',
    instagram: initialData.instagram || '',
    twitter: initialData.twitter || '',
    linkedin: initialData.linkedin || '',
    github: initialData.github || '',
    youtube: initialData.youtube || '',
    facebook: initialData.facebook || '',
    snapchat: initialData.snapchat || '',
    discord: initialData.discord || '',
    twitch: initialData.twitch || '',
    telegram: initialData.telegram || '',
    reddit: initialData.reddit || '',
    spotify: initialData.spotify || '',
    medium: initialData.medium || '',
    threads: initialData.threads || '',
  });

  // Keep local state in sync when navigating back to this step
  useEffect(() => {
    setSocialLinks(prev => ({
      ...prev,
      email: initialData.email || userEmail || '',
      phone: initialData.phone || '',
      whatsapp: initialData.whatsapp || '',
      instagram: initialData.instagram || '',
      twitter: initialData.twitter || '',
      linkedin: initialData.linkedin || '',
      github: initialData.github || '',
      youtube: initialData.youtube || '',
      facebook: initialData.facebook || '',
      snapchat: initialData.snapchat || '',
      discord: initialData.discord || '',
      twitch: initialData.twitch || '',
      telegram: initialData.telegram || '',
      reddit: initialData.reddit || '',
      spotify: initialData.spotify || '',
      medium: initialData.medium || '',
      threads: initialData.threads || '',
    }));
    // We depend on both initialData and userEmail to rehydrate
  }, [initialData, userEmail]);

  const socialPlatforms = [
    { key: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, placeholder: 'your.email@example.com', type: 'email' },
    { key: 'phone', name: 'Phone', icon: <Phone className="w-5 h-5" />, placeholder: 'phone number', type: 'tel' },
    { key: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, placeholder: 'phone number or wa.me/username' },
    { key: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" />, placeholder: '@username' },
    { key: 'twitter', name: 'Twitter/X', icon: <Twitter className="w-5 h-5" />, placeholder: '@username' },
    { key: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, placeholder: 'linkedin.com/in/username' },
    { key: 'github', name: 'GitHub', icon: <Github className="w-5 h-5" />, placeholder: 'github.com/username' },
    { key: 'youtube', name: 'YouTube', icon: <Youtube className="w-5 h-5" />, placeholder: 'youtube.com/@username' },
    { key: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, placeholder: 'facebook.com/username' },
    { key: 'snapchat', name: 'Snapchat', icon: <MessageCircle className="w-5 h-5" />, placeholder: '@username' },
    { key: 'discord', name: 'Discord', icon: <MessageCircle className="w-5 h-5" />, placeholder: 'username#1234' },
    { key: 'twitch', name: 'Twitch', icon: <Gamepad2 className="w-5 h-5" />, placeholder: 'twitch.tv/username' },
    { key: 'telegram', name: 'Telegram', icon: <Send className="w-5 h-5" />, placeholder: '@username' },
    { key: 'reddit', name: 'Reddit', icon: <MessageCircle className="w-5 h-5" />, placeholder: 'u/username' },
    { key: 'spotify', name: 'Spotify', icon: <Music className="w-5 h-5" />, placeholder: 'open.spotify.com/user/username' },
    { key: 'medium', name: 'Medium', icon: <BookOpen className="w-5 h-5" />, placeholder: 'medium.com/@username' },
    { key: 'threads', name: 'Threads', icon: <Twitter className="w-5 h-5" />, placeholder: '@username' },
  ];

  const handleInputChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit full set so navigating back restores exact values
    onNext({ socialLinks });
  };

  const hasAnyLinks = Object.values(socialLinks).some(value => value.trim() !== '');

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="max-w-2xl w-full mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Step 1 of 2
            </span>
            <span className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Social Media Handles
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${
            isDark ? "bg-slate-700" : "bg-gray-200"
          }`}>
            <div className="h-2 bg-primary-600 rounded-full w-1/2 transition-all duration-300"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className={`rounded-2xl p-4 sm:p-8 shadow-soft-lg ${
          isDark 
            ? "bg-slate-800/50 border border-slate-700/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 brand-font">
              Add Your Contact & Social Links
            </h1>
            <p className={`text-sm sm:text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Add your contact information and social media accounts to create your Flink profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key}>
                  <label htmlFor={platform.key} className={`flex items-center text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}>
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </label>
                  <input
                    type={platform.type || "text"}
                    id={platform.key}
                    value={socialLinks[platform.key]}
                    onChange={(e) => handleInputChange(platform.key, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                      platform.key === 'email' && userEmail
                        ? isDark
                          ? "bg-slate-600/50 border border-green-500 text-green-300 cursor-not-allowed"
                          : "bg-green-50 border border-green-300 text-green-700 cursor-not-allowed"
                        : isDark
                        ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                        : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                    }`}
                    placeholder={platform.placeholder}
                    disabled={platform.key === 'email' && userEmail} // Disable email if pre-filled
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {platform.key === 'email' && userEmail && (
                    <p className={`mt-1 text-xs ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}>
                      ✓ Pre-filled from your account
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={onBack}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-base border-2 ${
                  isDark
                    ? "bg-slate-800/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-gray-300 hover:text-white"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900"
                }`}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-base"
              >
                Continue →
              </button>
            </div>
          </form>

          {!hasAnyLinks && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className={`text-sm ${
                isDark ? "text-blue-300" : "text-blue-700"
              }`}>
                💡 <strong>Tip:</strong> Add your contact information and social media handles. You can skip any fields and add them later from your dashboard.
              </p>
            </div>
          )}

          {/* Skip Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => onNext({ socialLinks: {} })}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                isDark 
                  ? "text-gray-400 hover:text-gray-200 hover:bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 border border-gray-200/50 hover:border-gray-300/50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHandlesForm;
