import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import BackgroundPattern from '../components/BackgroundPattern';
import { 
  ArrowLeft, 
  User, 
  Share2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  MessageCircle,
  Gamepad2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, userDetails, getSocialLinks, getProfileDetails } = useAuth();
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const hasLoadedData = useRef(false);

  // Load user data with local storage caching
  useEffect(() => {
    const loadUserData = async () => {
      // Prevent multiple loads
      if (hasLoadedData.current || !user?.id) {
        return;
      }

      setLoading(true);
      
      try {
        console.log('Loading profile page data...');

        // Try to get cached data from local storage
        const cachedSocialLinks = localStorage.getItem(`socialLinks_${user.id}`);
        const cachedProfileDetails = localStorage.getItem(`profileDetails_${user.id}`);
        const cacheTimestamp = localStorage.getItem(`cacheTimestamp_${user.id}`);
        
        // Check if cache is still valid (less than 5 minutes old)
        const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 5 * 60 * 1000;
        
        if (isCacheValid && cachedSocialLinks && cachedProfileDetails) {
          // Use cached data
          console.log('Using cached profile data');
          setSocialLinks(JSON.parse(cachedSocialLinks));
          setProfileDetails(JSON.parse(cachedProfileDetails));
        } else {
          // Fetch fresh data from API
          console.log('Fetching fresh profile data');
          
          const [socialResult, profileResult] = await Promise.all([
            getSocialLinks(user.id),
            getProfileDetails(user.id)
          ]);
          
          if (!socialResult.error) {
            setSocialLinks(socialResult.data || []);
            localStorage.setItem(`socialLinks_${user.id}`, JSON.stringify(socialResult.data || []));
          }

          if (!profileResult.error) {
            setProfileDetails(profileResult.data);
            localStorage.setItem(`profileDetails_${user.id}`, JSON.stringify(profileResult.data));
          }

          localStorage.setItem(`cacheTimestamp_${user.id}`, Date.now().toString());
        }
        
        setLoading(false);
        hasLoadedData.current = true;
      } catch (err) {
        console.error('Error loading user data:', err);
        setLoading(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleShare = async () => {
    const profileUrl = window.location.origin + '/profile';
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userDetails?.name || user?.email}'s Profile`,
          text: `Check out ${userDetails?.name || user?.email}'s profile on Flink`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

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
    return icons[platform] || <ExternalLink className="w-5 h-5" />;
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

  // Helper function to format URL for clicking
  const formatUrlForClick = (url, platform) => {
    if (platform === "email") {
      const cleanEmail = url.replace(/^mailto:/, '');
      return `mailto:${cleanEmail}`;
    } else if (platform === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`;
    } else {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      
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
      
      return `https://${url}`;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${
      isDark ? "text-white" : "text-gray-900"
    }`}>
      <BackgroundPattern />
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
              <User className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <h1 className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Profile
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header Card */}
        <div className={`relative overflow-hidden rounded-3xl mb-8 ${
          isDark 
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700" 
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
        }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full transform -translate-x-24 translate-y-24"></div>
          </div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative">
                {userDetails?.profile_url ? (
                  <img
                    src={userDetails.profile_url}
                    alt="Profile"
                    loading="lazy"
                    decoding="async"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                    onLoad={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.1s ease-in-out' }}
                  />
                ) : null}
                <div 
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/20 shadow-2xl ${
                    userDetails?.profile_url ? "hidden" : "flex"
                  } ${
                    isDark 
                      ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white" 
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                  }`}
                >
                  {userDetails?.name
                    ? userDetails.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {userDetails?.name || "User Profile"}
                </h1>
                <p className={`text-lg mb-4 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {userDetails?.email || user?.email}
                </p>
                
                {/* Bio */}
                {profileDetails?.bio && (
                  <p className={`text-base mb-4 max-w-2xl ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {profileDetails.bio}
                  </p>
                )}

                {/* Profile Stats */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {profileDetails?.location && (
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                      isDark 
                        ? "bg-slate-700/50 text-gray-300" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{profileDetails.location}</span>
                    </div>
                  )}
                  
                  {profileDetails?.website && (
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                      isDark 
                        ? "bg-slate-700/50 text-gray-300" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      <Globe className="w-4 h-4" />
                      <a 
                        href={profileDetails.website.startsWith('http') ? profileDetails.website : `https://${profileDetails.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}

                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                    isDark 
                      ? "bg-slate-700/50 text-gray-300" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Joined {userDetails?.created_at ? new Date(userDetails.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleShare}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Grid */}
        {socialLinks.length > 0 && (
          <div className={`p-6 rounded-2xl mb-8 ${
            isDark 
              ? "bg-slate-800 border border-slate-700" 
              : "bg-white border border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Connect With Me
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark 
                  ? "bg-slate-700 text-gray-300" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {socialLinks.length} {socialLinks.length === 1 ? 'Link' : 'Links'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {socialLinks.map((link, index) => {
                const clickUrl = formatUrlForClick(link.url, link.platform);
                
                // Platform-specific colors
                const getPlatformColor = (platform) => {
                  const colors = {
                    email: isDark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-100",
                    phone: isDark ? "text-green-400 bg-green-500/20" : "text-green-600 bg-green-100",
                    instagram: isDark ? "text-pink-400 bg-pink-500/20" : "text-pink-600 bg-pink-100",
                    twitter: isDark ? "text-sky-400 bg-sky-500/20" : "text-sky-600 bg-sky-100",
                    linkedin: isDark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-100",
                    github: isDark ? "text-gray-400 bg-gray-500/20" : "text-gray-600 bg-gray-100",
                    youtube: isDark ? "text-red-400 bg-red-500/20" : "text-red-600 bg-red-100",
                    facebook: isDark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-100",
                    snapchat: isDark ? "text-yellow-400 bg-yellow-500/20" : "text-yellow-600 bg-yellow-100",
                    discord: isDark ? "text-indigo-400 bg-indigo-500/20" : "text-indigo-600 bg-indigo-100",
                    twitch: isDark ? "text-purple-400 bg-purple-500/20" : "text-purple-600 bg-purple-100"
                  };
                  return colors[platform] || colors.email;
                };

                const platformColor = getPlatformColor(link.platform);
                
                return (
                  <a
                    key={index}
                    href={clickUrl}
                    target={link.platform === "email" || link.platform === "phone" ? "_self" : "_blank"}
                    rel={link.platform === "email" || link.platform === "phone" ? "" : "noopener noreferrer"}
                    className={`group p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                      isDark
                        ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      {/* Platform Icon */}
                      <div className={`p-3 rounded-xl ${platformColor.split(' ')[1]} group-hover:scale-110 transition-transform duration-200`}>
                        <div className={platformColor.split(' ')[0]}>
                          {getSocialIcon(link.platform)}
                        </div>
                      </div>
                      
                      {/* Platform Name */}
                      <div className="min-w-0 w-full">
                        <p className={`font-medium text-sm ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}>
                          {getSocialName(link.platform)}
                        </p>
                        <p className={`text-xs truncate mt-1 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {link.url.replace(/^(mailto:|tel:)/, '')}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        {/* <div className={`p-6 rounded-2xl ${
          isDark 
            ? "bg-slate-800 border border-slate-700" 
            : "bg-white border border-gray-200"
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            isDark ? "text-white" : "text-gray-800"
          }`}>
            About
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className={`w-5 h-5 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  Full Name
                </p>
                <p className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {userDetails?.name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className={`w-5 h-5 ${
                isDark ? "text-green-400" : "text-green-600"
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  Email Address
                </p>
                <p className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {userDetails?.email || user?.email || "Not provided"}
                </p>
              </div>
            </div>

            {profileDetails?.location && (
              <div className="flex items-center space-x-3">
                <MapPin className={`w-5 h-5 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`} />
                <div>
                  <p className={`font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    Location
                  </p>
                  <p className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {profileDetails.location}
                  </p>
                </div>
              </div>
            )}

            {profileDetails?.website && (
              <div className="flex items-center space-x-3">
                <Globe className={`w-5 h-5 ${
                  isDark ? "text-purple-400" : "text-purple-600"
                }`} />
                <div>
                  <p className={`font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    Website
                  </p>
                  <a 
                    href={profileDetails.website.startsWith('http') ? profileDetails.website : `https://${profileDetails.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm hover:underline ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {profileDetails.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className={`w-5 h-5 ${
                isDark ? "text-orange-400" : "text-orange-600"
              }`} />
              <div>
                <p className={`font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  Member Since
                </p>
                <p className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {userDetails?.created_at ? new Date(userDetails.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProfilePage;
