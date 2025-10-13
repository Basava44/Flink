import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const SocialHandlesForm = ({ onNext, onBack, initialData = {}, userEmail = '' }) => {
  const { isDark } = useTheme();
  const [socialLinks, setSocialLinks] = useState({
    email: initialData.email || userEmail || '',
    phone: initialData.phone || '',
    instagram: initialData.instagram || '',
    twitter: initialData.twitter || '',
    linkedin: initialData.linkedin || '',
    github: initialData.github || '',
    youtube: initialData.youtube || '',
    facebook: initialData.facebook || '',
    snapchat: initialData.snapchat || '',
    discord: initialData.discord || '',
    twitch: initialData.twitch || '',
  });

  const socialPlatforms = [
    { key: 'email', name: 'Email', icon: '📧', placeholder: 'your.email@example.com', type: 'email' },
    { key: 'phone', name: 'Phone', icon: '📱', placeholder: '+91 9876543210', type: 'tel' },
    { key: 'instagram', name: 'Instagram', icon: '📷', placeholder: '@username' },
    { key: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: '@username' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/username' },
    { key: 'github', name: 'GitHub', icon: '💻', placeholder: 'github.com/username' },
    { key: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'youtube.com/@username' },
    { key: 'facebook', name: 'Facebook', icon: '👥', placeholder: 'facebook.com/username' },
    { key: 'snapchat', name: 'Snapchat', icon: '👻', placeholder: '@username' },
    { key: 'discord', name: 'Discord', icon: '🎮', placeholder: 'username#1234' },
    { key: 'twitch', name: 'Twitch', icon: '🎮', placeholder: 'twitch.tv/username' },
  ];

  const handleInputChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty values
    const filteredLinks = Object.entries(socialLinks)
      .filter(([, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value.trim();
        return acc;
      }, {});
    
    onNext({ socialLinks: filteredLinks });
  };

  const hasAnyLinks = Object.values(socialLinks).some(value => value.trim() !== '');

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="max-w-2xl w-full">
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
        <div className={`rounded-2xl p-8 shadow-soft-lg ${
          isDark 
            ? "bg-slate-800/50 border border-slate-700/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 brand-font">
              Add Your Contact & Social Links
            </h1>
            <p className={`${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Add your contact information and social media accounts to create your Flink profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key}>
                  <label htmlFor={platform.key} className={`block text-sm font-medium mb-2 ${
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

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={onBack}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
              >
                Next: Profile Setup
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
        </div>
      </div>
    </div>
  );
};

export default SocialHandlesForm;
