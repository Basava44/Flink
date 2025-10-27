import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const SettingsModal = ({ isOpen, onClose, socialLinks, profileDetails, onUpdate }) => {
  const { isDark } = useTheme();
  const { supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Convert social links array to object format for editing
  const [socialLinksData, setSocialLinksData] = useState({});
  // Profile details for editing
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    website: ''
  });
  
  const socialPlatforms = [
    { key: 'phone', name: 'Phone', icon: '📱', placeholder: 'phone number', type: 'tel' },
    { key: 'whatsapp', name: 'WhatsApp', icon: '💬', placeholder: 'phone number or wa.me/username' },
    { key: 'instagram', name: 'Instagram', icon: '📷', placeholder: '@username' },
    { key: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: '@username' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/username' },
    { key: 'github', name: 'GitHub', icon: '💻', placeholder: 'github.com/username' },
    { key: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'youtube.com/@username' },
    { key: 'facebook', name: 'Facebook', icon: '👥', placeholder: 'facebook.com/username' },
    { key: 'snapchat', name: 'Snapchat', icon: '👻', placeholder: '@username' },
    { key: 'discord', name: 'Discord', icon: '🎮', placeholder: 'username#1234' },
    { key: 'twitch', name: 'Twitch', icon: '🎮', placeholder: 'twitch.tv/username' },
    { key: 'telegram', name: 'Telegram', icon: '✈️', placeholder: '@username' },
    { key: 'reddit', name: 'Reddit', icon: '🔴', placeholder: 'u/username' },
    { key: 'spotify', name: 'Spotify', icon: '🎵', placeholder: 'open.spotify.com/user/username' },
    { key: 'medium', name: 'Medium', icon: '📝', placeholder: 'medium.com/@username' },
    { key: 'threads', name: 'Threads', icon: '🧵', placeholder: '@username' },
  ];

  // Initialize form data when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      // Initialize social links
      if (socialLinks) {
        const linksObject = {};
        socialLinks.forEach(link => {
          linksObject[link.platform] = link.url;
        });
        setSocialLinksData(linksObject);
      }
      
      // Initialize profile data
      if (profileDetails) {
        setProfileData({
          bio: profileDetails.bio || '',
          location: profileDetails.location || '',
          website: profileDetails.website || ''
        });
      }
    }
  }, [isOpen, socialLinks, profileDetails]);

  const handleInputChange = (platform, value) => {
    setSocialLinksData(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current social links to compare
      const { data: currentLinks } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id);

      // Prepare data for upsert (update or insert)
      const linksToUpdate = [];
      const linksToDelete = [];

      // Check which links need to be updated or deleted
      socialPlatforms.forEach(platform => {
        const currentLink = currentLinks?.find(link => link.platform === platform.key);
        const newValue = socialLinksData[platform.key]?.trim() || '';

        if (newValue && newValue !== currentLink?.url) {
          // Link needs to be updated or created
          linksToUpdate.push({
            user_id: user.id,
            platform: platform.key,
            url: newValue,
            updated_at: new Date().toISOString()
          });
        } else if (!newValue && currentLink) {
          // Link needs to be deleted
          linksToDelete.push(currentLink.id);
        }
      });

      // Delete links that are no longer needed
      if (linksToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('social_links')
          .delete()
          .in('id', linksToDelete);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Update or insert links
      if (linksToUpdate.length > 0) {
        const { error: upsertError } = await supabase
          .from('social_links')
          .upsert(linksToUpdate, {
            onConflict: 'user_id,platform'
          });

        if (upsertError) {
          throw upsertError;
        }
      }

      // Update profile details
      const { error: profileError } = await supabase
        .from('flink_profiles')
        .update({
          bio: profileData.bio.trim() || null,
          location: profileData.location.trim() || null,
          website: profileData.website.trim() || null,
          private: profileData.private || false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      setSuccess('Profile and social links updated successfully!');
      
      // Refresh the social links in parent component
      if (onUpdate) {
        await onUpdate();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error updating social links:', err);
      setError(err.message || 'Failed to update social links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDark 
          ? "bg-slate-800 border border-slate-700" 
          : "bg-white border border-gray-200"
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          isDark 
            ? "border-slate-700 bg-slate-800" 
            : "border-gray-200 bg-white"
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? "bg-primary-900/30" : "bg-primary-100"
            }`}>
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Edit Profile & Social Links
              </h2>
              <p className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Update your profile details and social media links
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Message */}
          <div className={`mb-6 p-4 rounded-xl ${
            isDark 
              ? "bg-blue-900/20 border border-blue-800 text-blue-300" 
              : "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Note:</p>
                <p className="text-sm mt-1">
                  Email and Flink profile handle cannot be edited here. Email is managed through your account settings, and your Flink handle is permanent. You can edit your bio, location, website, and all social media links.
                </p>
              </div>
            </div>
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
                    value={socialLinksData[platform.key] || ''}
                    onChange={(e) => handleInputChange(platform.key, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                      isDark
                        ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                        : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                    }`}
                    placeholder={platform.placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Profile Details Section */}
            <div className="mt-8">
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Profile Details
              </h3>
              
              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}>
                    <span className="mr-2">📝</span>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                      isDark
                        ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                        : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Location and Website Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                      <span className="mr-2">📍</span>
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                          : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                      }`}
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                      <span className="mr-2">🌐</span>
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={profileData.website}
                      onChange={(e) => handleProfileChange('website', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                          : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-xl ${
                isDark 
                  ? "bg-red-900/20 border border-red-800 text-red-300" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={`p-4 rounded-xl ${
                isDark 
                  ? "bg-green-900/20 border border-green-800 text-green-300" 
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
