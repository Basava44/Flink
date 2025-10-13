import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import OnboardingFlow from "../components/OnboardingFlow";
// import ThemeToggle from "../components/ThemeToggle";

function Dashboard() {
  const navigate = useNavigate();
  const { user, userDetails, signOut, getUserDetails, getSocialLinks, getProfileDetails } = useAuth();
  const { isDark } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (userDetails && userDetails.first_login === true) {
      setShowOnboarding(true);
    }
  }, [userDetails]);

  // Fetch social links and profile details when user is not in first login
  useEffect(() => {
    const fetchUserData = async () => {
      if (userDetails && userDetails.first_login === false && user?.id) {
        setLoadingData(true);
        try {
          // Fetch social links
          const { data: socialData, error: socialError } = await getSocialLinks(user.id);
          if (socialError) {
            console.error('Error fetching social links:', socialError);
          } else {
            setSocialLinks(socialData || []);
          }

          // Fetch profile details
          const { data: profileData, error: profileError } = await getProfileDetails(user.id);
          if (profileError) {
            console.error('Error fetching profile details:', profileError);
          } else {
            setProfileDetails(profileData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [userDetails, user?.id, getSocialLinks, getProfileDetails]);

  const handleOnboardingComplete = async () => {
    console.log('Onboarding completed, refreshing user details...');
    // Refresh user details to get updated first_login status
    await getUserDetails(user.id);
    
    // Also refresh social links and profile details
    if (user?.id) {
      const { data: socialData } = await getSocialLinks(user.id);
      const { data: profileData } = await getProfileDetails(user.id);
      setSocialLinks(socialData || []);
      setProfileDetails(profileData);
    }
    
    setShowOnboarding(false);
  };

  // Helper function to get social media icon
  const getSocialIcon = (platform) => {
    const icons = {
      email: '📧',
      phone: '📱',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼',
      github: '💻',
      youtube: '📺',
      facebook: '👥',
      snapchat: '👻',
      discord: '🎮',
      twitch: '🎮',
    };
    return icons[platform] || '🔗';
  };

  // Helper function to get social media name
  const getSocialName = (platform) => {
    const names = {
      email: 'Email',
      phone: 'Phone',
      instagram: 'Instagram',
      twitter: 'Twitter/X',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      youtube: 'YouTube',
      facebook: 'Facebook',
      snapchat: 'Snapchat',
      discord: 'Discord',
      twitch: 'Twitch',
    };
    return names[platform] || platform;
  };

  // Helper function to format URL for display
  const formatUrlForDisplay = (url, platform) => {
    if (platform === 'email') {
      return url;
    }
    if (platform === 'phone') {
      return url;
    }
    
    try {
      const urlObj = new URL(url);
      // For social platforms, show just the username or path
      if (platform === 'instagram' || platform === 'twitter' || platform === 'snapchat') {
        return urlObj.pathname.replace('/', '@') || url;
      }
      if (platform === 'github') {
        return urlObj.pathname || url;
      }
      if (platform === 'linkedin') {
        return urlObj.pathname.replace('/in/', '') || url;
      }
      if (platform === 'youtube') {
        return urlObj.pathname.replace('/@', '@') || url;
      }
      if (platform === 'facebook') {
        return urlObj.pathname || url;
      }
      if (platform === 'discord') {
        return url;
      }
      if (platform === 'twitch') {
        return urlObj.pathname || url;
      }
      
      // For other platforms, show domain + path
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Dashboard: Starting sign out...');
      const { error } = await signOut();
      console.log('Dashboard: Sign out result:', { error });
      
      if (error) {
        console.error("Error signing out:", error);
        // You might want to show an error message to the user here
        return;
      }
      
      console.log('Dashboard: Sign out successful, redirecting to home');
      navigate('/');
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  // Show onboarding flow for first-time users
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        user={user}
        userDetails={userDetails}
      />
    );
  }

  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Dashboard is designed for mobile devices. Please access it from your phone or resize your browser window.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Mobile Dashboard - Visible only on mobile */}
      <div className={`md:hidden min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="relative">
              {userDetails?.profile_url ? (
                <img
                  src={userDetails.profile_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-primary-500 shadow-lg ${
                  userDetails?.profile_url ? 'hidden' : 'flex'
                } ${
                  isDark 
                    ? 'bg-slate-700 text-white border-slate-600' 
                    : 'bg-primary-100 text-primary-600'
                }`}
              >
                {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold brand-font mb-2">
                Welcome to Flink
              </h1>
              <p className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                {userDetails?.name || user?.email}
              </p>
              {userDetails?.name && (
                <p className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  {user?.email}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
          >
            Sign Out
          </button>
        </header>

        {/* User Details Section */}
        {userDetails && (
          <div className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <div className="flex items-center space-x-6 mb-6">
              {/* Large Profile Picture */}
              <div className="relative">
                {userDetails?.profile_url ? (
                  <img
                    src={userDetails.profile_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-primary-500 shadow-lg ${
                    userDetails?.profile_url ? 'hidden' : 'flex'
                  } ${
                    isDark 
                      ? 'bg-slate-700 text-white border-slate-600' 
                      : 'bg-primary-100 text-primary-600'
                  }`}
                >
                  {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  {userDetails.name || 'User Profile'}
                </h2>
                <p className={`text-lg ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {userDetails.email || user?.email}
                </p>
                {userDetails.first_login && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    isDark 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    First Login
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  User ID:
                </span>
                <p className={`${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  {userDetails.id}
                </p>
              </div>
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Email:
                </span>
                <p className={`${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  {userDetails.email || user?.email}
                </p>
              </div>
              {userDetails.profile_url && (
                <div>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Profile URL:
                  </span>
                  <p className={`${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    <a 
                      href={userDetails.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 underline break-all"
                    >
                      {userDetails.profile_url}
                    </a>
                  </p>
                </div>
              )}
              {userDetails.created_at && (
                <div>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Created At:
                  </span>
                  <p className={`${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    {new Date(userDetails.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <pre className={`text-xs p-4 rounded-lg overflow-auto ${
                isDark 
                  ? "bg-slate-900 text-gray-300" 
                  : "bg-gray-100 text-gray-700"
              }`}>
                {JSON.stringify(userDetails, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Your Social Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 min-w-0 ${
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
                      <p className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}>
                        {getSocialName(link.platform)}
                      </p>
                      <p className={`text-sm truncate ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`} title={link.url}>
                        {formatUrlForDisplay(link.url, link.platform)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Profile Details Section */}
        {profileDetails && (
          <div className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Your Flink Profile
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Flink Handle:
                </span>
                <p className={`${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  <a 
                    href={`https://flink.to/${profileDetails.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-500 underline"
                  >
                    flink.to/{profileDetails.handle}
                  </a>
                </p>
              </div>
              {profileDetails.created_at && (
                <div>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Profile Created:
                  </span>
                  <p className={`${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    {new Date(profileDetails.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className={`mb-8 p-6 rounded-2xl text-center ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className={`${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Loading your profile data...
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30" 
              : "bg-white border border-gray-200 hover:border-primary-300"
          }`}>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Profile Setup
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Complete your profile to get started
            </p>
            <button className="text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors duration-200">
              Set up profile →
            </button>
          </div>

          {/* Social Links Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-accent-500/30" 
              : "bg-white border border-gray-200 hover:border-accent-300"
          }`}>
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Add Social Links
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Connect your social media accounts
            </p>
            <button className="text-accent-600 hover:text-accent-500 font-medium text-sm transition-colors duration-200">
              Add links →
            </button>
          </div>

          {/* Share Flink Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30" 
              : "bg-white border border-gray-200 hover:border-primary-300"
          }`}>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Share Your Flink
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Get your unique link and QR code
            </p>
            <button className="text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors duration-200">
              Get link →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-800"
          }`}>
            Quick Stats
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Profile Views
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                {socialLinks.length}
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Social Links
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Link Clicks
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                {profileDetails ? '1' : '0'}
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Flink Profile
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Dashboard;