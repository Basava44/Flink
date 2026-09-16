import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  Mail, Phone, Instagram, Twitter, Linkedin, Github, Youtube,
  Facebook, MessageCircle, Gamepad2, Send, BookOpen, Music, Link2,
  Plus, Trash2, Link,
} from 'lucide-react';

const PLATFORMS = [
  { key: 'email', name: 'Email', icon: Mail, placeholder: 'your.email@example.com', type: 'email' },
  { key: 'phone', name: 'Phone', icon: Phone, placeholder: 'phone number', type: 'tel' },
  { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, placeholder: 'phone number or wa.me link' },
  { key: 'instagram', name: 'Instagram', icon: Instagram, placeholder: '@username' },
  { key: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: '@username' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/username' },
  { key: 'github', name: 'GitHub', icon: Github, placeholder: 'username' },
  { key: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'youtube.com/@username' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'facebook.com/username' },
  { key: 'snapchat', name: 'Snapchat', icon: MessageCircle, placeholder: '@username' },
  { key: 'discord', name: 'Discord', icon: MessageCircle, placeholder: 'username#1234' },
  { key: 'twitch', name: 'Twitch', icon: Gamepad2, placeholder: 'twitch.tv/username' },
  { key: 'telegram', name: 'Telegram', icon: Send, placeholder: '@username' },
  { key: 'reddit', name: 'Reddit', icon: MessageCircle, placeholder: 'u/username' },
  { key: 'spotify', name: 'Spotify', icon: Music, placeholder: 'open.spotify.com/user/...' },
  { key: 'medium', name: 'Medium', icon: BookOpen, placeholder: 'medium.com/@username' },
  { key: 'threads', name: 'Threads', icon: Twitter, placeholder: '@username' },
];

const SocialHandlesForm = ({ onNext, onBack, initialData = {}, userEmail = '' }) => {
  const { isDark } = useTheme();
  const [socialLinks, setSocialLinks] = useState(() => {
    const defaults = {};
    PLATFORMS.forEach(p => { defaults[p.key] = initialData[p.key] || ''; });
    defaults.email = initialData.email || userEmail || '';
    return defaults;
  });
  const [customLinks, setCustomLinks] = useState(initialData.customLinks || []);

  useEffect(() => {
    setSocialLinks(prev => {
      const updated = { ...prev };
      PLATFORMS.forEach(p => { updated[p.key] = initialData[p.key] || (p.key === 'email' ? userEmail : '') || prev[p.key]; });
      return updated;
    });
    if (initialData.customLinks) setCustomLinks(initialData.customLinks);
  }, [initialData, userEmail]);

  const handleInputChange = (platform, value) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const addCustomLink = () => {
    if (customLinks.length >= 5) return;
    setCustomLinks(prev => [...prev, { label: '', url: '' }]);
  };

  const updateCustomLink = (index, field, value) => {
    setCustomLinks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeCustomLink = (index) => {
    setCustomLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ socialLinks, customLinks: customLinks.filter(l => l.label.trim() && l.url.trim()) });
  };

  const filledCount = Object.values(socialLinks).filter(v => v.trim() !== '').length
    + customLinks.filter(l => l.label.trim() && l.url.trim()).length;

  const inputClass = `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
    isDark
      ? "bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
      : "bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
  }`;

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
      <div className="min-h-screen flex">
        {/* Left panel - visible on lg+ */}
        <div className={`hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col items-center justify-center p-12 ${
          isDark ? "bg-zinc-900" : "bg-zinc-100"
        }`}>
          <div className="max-w-xs text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600`}>
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
              All your socials, one link
            </h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Add your social accounts and we'll create a beautiful profile page you can share with anyone.
            </p>

            {/* Live counter */}
            <div className={`mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isDark ? "bg-zinc-800 text-zinc-300" : "bg-white text-zinc-600 shadow-sm"
            }`}>
              <div className={`w-2 h-2 rounded-full ${filledCount > 0 ? "bg-green-500" : isDark ? "bg-zinc-600" : "bg-zinc-300"}`} />
              {filledCount} link{filledCount !== 1 ? "s" : ""} added
            </div>

            {/* Visual decoration */}
            <div className="mt-10 space-y-2">
              {["Instagram", "Twitter", "GitHub", "LinkedIn"].map((name, i) => (
                <div
                  key={name}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                    isDark ? "bg-zinc-800/50" : "bg-white/80"
                  }`}
                  style={{ opacity: 0.4 + (i * 0.15) }}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                    ["from-pink-500 to-rose-500", "from-sky-400 to-blue-500", "from-gray-700 to-gray-900", "from-blue-600 to-blue-700"][i]
                  } flex items-center justify-center`}>
                    {[<Instagram key="ig" className="w-3.5 h-3.5 text-white" />,
                      <Twitter key="tw" className="w-3.5 h-3.5 text-white" />,
                      <Github key="gh" className="w-3.5 h-3.5 text-white" />,
                      <Linkedin key="li" className="w-3.5 h-3.5 text-white" />][i]}
                  </div>
                  <div className={`h-2 rounded-full flex-1 ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-start lg:items-center justify-center overflow-y-auto">
          <div className="w-full max-w-lg px-4 py-8 lg:px-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Step 1 of 2</span>
                <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Social links</span>
              </div>
              <div className={`w-full h-1 rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-1/2 transition-all duration-300" />
              </div>
            </div>

            {/* Header - hidden on lg since left panel has it */}
            <div className="mb-6 lg:mb-8">
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                Add your social links
              </h1>
              <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Fill in what you use. Skip the rest.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isEmailPrefilled = platform.key === 'email' && userEmail;

                  return (
                    <div key={platform.key} className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <input
                        type={platform.type || "text"}
                        value={socialLinks[platform.key]}
                        onChange={(e) => handleInputChange(platform.key, e.target.value)}
                        className={`${inputClass} ${
                          isEmailPrefilled
                            ? isDark
                              ? "border-green-800 bg-green-900/10 text-green-300"
                              : "border-green-300 bg-green-50 text-green-700"
                            : ""
                        }`}
                        placeholder={platform.name}
                        disabled={!!isEmailPrefilled}
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Custom Links */}
              <div className={`mt-6 pt-5 border-t ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Custom links
                  </p>
                  {customLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={addCustomLink}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 ${
                        isDark
                          ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  )}
                </div>
                {customLinks.length === 0 ? (
                  <button
                    type="button"
                    onClick={addCustomLink}
                    className={`w-full py-3 rounded-xl border border-dashed text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      isDark
                        ? "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                        : "border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500"
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    Add a resume, portfolio, or other link
                  </button>
                ) : (
                  <div className="space-y-2">
                    {customLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                          <Link className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateCustomLink(idx, 'label', e.target.value)}
                          className={inputClass}
                          placeholder="Label"
                          style={{ paddingLeft: '0.75rem' }}
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateCustomLink(idx, 'url', e.target.value)}
                          className={inputClass}
                          placeholder="https://..."
                          style={{ paddingLeft: '0.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomLink(idx)}
                          className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                            isDark
                              ? "text-zinc-500 hover:text-red-400"
                              : "text-zinc-400 hover:text-red-500"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => onNext({ socialLinks: {} })}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? "border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHandlesForm;
