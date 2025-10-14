import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  Settings, 
  X, 
  Info, 
  CheckCircle, 
  AlertCircle, 
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
  MapPin,
  Globe,
  FileText
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, supabase, getSocialLinks, getProfileDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [showActionBar, setShowActionBar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  
  // Convert social links array to object format for editing
  const [socialLinksData, setSocialLinksData] = useState({});
  // Profile details for editing
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    website: ''
  });

  const socialPlatforms = [
    { key: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, placeholder: 'your@email.com', type: 'email' },
    { key: 'phone', name: 'Phone', icon: <Phone className="w-5 h-5" />, placeholder: '+91 9876543210', type: 'tel' },
    { key: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" />, placeholder: '@username' },
    { key: 'twitter', name: 'Twitter/X', icon: <Twitter className="w-5 h-5" />, placeholder: '@username' },
    { key: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, placeholder: 'linkedin.com/in/username' },
    { key: 'github', name: 'GitHub', icon: <Github className="w-5 h-5" />, placeholder: 'github.com/username' },
    { key: 'youtube', name: 'YouTube', icon: <Youtube className="w-5 h-5" />, placeholder: 'youtube.com/@username' },
    { key: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, placeholder: 'facebook.com/username' },
    { key: 'snapchat', name: 'Snapchat', icon: <MessageCircle className="w-5 h-5" />, placeholder: '@username' },
    { key: 'discord', name: 'Discord', icon: <MessageCircle className="w-5 h-5" />, placeholder: 'username#1234' },
    { key: 'twitch', name: 'Twitch', icon: <Gamepad2 className="w-5 h-5" />, placeholder: 'twitch.tv/username' },
  ];

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Load social links
          const { data: socialData } = await getSocialLinks(user.id);
          setSocialLinks(socialData || []);
          
          // Load profile details
          const { data: profileData } = await getProfileDetails(user.id);
          setProfileDetails(profileData);
          
          // Initialize form data
          if (socialData) {
            const linksObject = {};
            socialData.forEach(link => {
              linksObject[link.platform] = link.url;
            });
            setSocialLinksData(linksObject);
          }
          
          if (profileData) {
            setProfileData({
              bio: profileData.bio || '',
              location: profileData.location || '',
              website: profileData.website || ''
            });
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user?.id, getSocialLinks, getProfileDetails]);

  // Scroll detection and idle state management
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if user is at bottom (within 100px)
      const atBottom = scrollTop + windowHeight >= documentHeight - 100;
      
      setShowActionBar(false);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        // Show action bar immediately if at bottom, or if user has changes and is idle
        if (atBottom) {
          setShowActionBar(true);
        } else if (hasChanges) {
          idleTimeoutRef.current = setTimeout(() => {
            setShowActionBar(true);
          }, 500); // 500ms idle delay
        }
      }, 150); // 150ms after scroll stops
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [hasChanges]);

  // Check for changes
  useEffect(() => {
    const checkForChanges = () => {
      // Check if social links have changed
      const currentSocialLinks = {};
      socialLinks.forEach(link => {
        currentSocialLinks[link.platform] = link.url;
      });
      
      const socialLinksChanged = JSON.stringify(currentSocialLinks) !== JSON.stringify(socialLinksData);
      
      // Check if profile data has changed
      const currentProfileData = {
        bio: profileDetails?.bio || '',
        location: profileDetails?.location || '',
        website: profileDetails?.website || ''
      };
      
      const profileChanged = JSON.stringify(currentProfileData) !== JSON.stringify(profileData);
      
      setHasChanges(socialLinksChanged || profileChanged);
    };

    checkForChanges();
  }, [socialLinksData, profileData, socialLinks, profileDetails]);

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
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare all social links to insert (only non-empty ones)
      const linksToInsert = [];

      socialPlatforms.forEach(platform => {
        const newValue = socialLinksData[platform.key]?.trim() || '';
        
        if (newValue) {
          // Only include non-empty links
          linksToInsert.push({
            user_id: user.id,
            platform: platform.key,
            url: newValue,
            private: platform.key === 'email' ? false : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });

      // Delete all existing social links for this user first
      const { error: deleteError } = await supabase
        .from('social_links')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new social links
      if (linksToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('social_links')
          .insert(linksToInsert);

        if (insertError) {
          throw insertError;
        }
      }

      // Update profile details
      const { error: profileError } = await supabase
        .from('flink_profiles')
        .update({
          bio: profileData.bio.trim() || null,
          location: profileData.location.trim() || null,
          website: profileData.website.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      setSuccess('Profile and social links updated successfully!');
      setShowSnackbar(true);
      setHasChanges(false);
      setShowActionBar(false);
      
      // Refresh the data
      const { data: socialData } = await getSocialLinks(user.id);
      const { data: updatedProfileData } = await getProfileDetails(user.id);
      setSocialLinks(socialData || []);
      setProfileDetails(updatedProfileData);

      // Update local storage cache with fresh data
      localStorage.setItem(`socialLinks_${user.id}`, JSON.stringify(socialData || []));
      localStorage.setItem(`profileDetails_${user.id}`, JSON.stringify(updatedProfileData));
      localStorage.setItem(`cacheTimestamp_${user.id}`, Date.now().toString());
      console.log('Cache updated with fresh data after settings save');

      // Auto-hide snackbar after 3 seconds
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Add slide-out animation
    const settingsPage = document.querySelector('.settings-page');
    if (settingsPage) {
      settingsPage.style.transform = 'translateX(100%)';
      settingsPage.style.transition = 'transform 0.3s ease-in-out';
    }
    
    // Navigate after animation
    setTimeout(() => {
      navigate('/dashboard');
    }, 300);
  };

  if (loading && !socialLinks.length && !profileDetails) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`settings-page min-h-screen transition-colors duration-300 slide-in-from-right ${
      isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Success Snackbar */}
      {showSnackbar && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`mx-auto max-w-sm rounded-lg shadow-lg border ${
            isDark 
              ? "bg-green-900/90 border-green-700 text-green-100" 
              : "bg-green-50 border-green-200 text-green-800"
          }`}>
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Profile and social links updated successfully!
                </p>
                <button
                  onClick={() => setShowSnackbar(false)}
                  className={`ml-auto p-1 rounded-full transition-colors ${
                    isDark 
                      ? "hover:bg-green-800 text-green-300 hover:text-green-100" 
                      : "hover:bg-green-100 text-green-600 hover:text-green-800"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${
        isDark 
          ? "bg-slate-800 border-slate-700" 
          : "bg-white border-gray-200"
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Settings className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <h1 className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Info Message */}
        <div className={`mb-6 p-3 rounded-lg ${
          isDark 
            ? "bg-slate-800/30 border border-slate-700 text-slate-300" 
            : "bg-gray-100 border border-gray-200 text-gray-600"
        }`}>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium">Note:</span> Email and Flink handle are permanent. Edit bio, location, website, and social links below.
            </p>
          </div>
        </div>

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Social Links Section */}
          <div className={`p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Social Media Links
            </h2>
            
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
          </div>

          {/* Profile Details Section */}
          <div className={`p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Profile Details
            </h2>
            
            <div className="space-y-4">
              {/* Bio */}
              <div>
                  <label htmlFor="bio" className={`flex items-center text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}>
                    <span className="mr-2"><FileText className="w-4 h-4" /></span>
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
                    <label htmlFor="location" className={`flex items-center text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                      <span className="mr-2"><MapPin className="w-4 h-4" /></span>
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
                    <label htmlFor="website" className={`flex items-center text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                      <span className="mr-2"><Globe className="w-4 h-4" /></span>
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
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Smart Floating Action Bar */}
      {showActionBar && (
        <div className={`fixed bottom-6 left-4 right-4 z-20 transform transition-all duration-500 ease-out ${
          showActionBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className={`backdrop-blur-lg rounded-2xl shadow-2xl border ${
            isDark 
              ? "bg-slate-800/90 border-slate-600/50" 
              : "bg-white/90 border-gray-200/50"
          }`}>
          <div className="p-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                  isDark
                    ? "bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white disabled:opacity-50 border border-slate-600/30"
                    : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-800 disabled:opacity-50 border border-gray-200/50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="settings-form"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-primary-400 disabled:to-primary-500 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:shadow-lg text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
