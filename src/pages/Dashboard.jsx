import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import OnboardingFlow from "../components/OnboardingFlow";
import ProfileSection from "../components/ProfileSection";
import SocialLinksSection from "../components/SocialLinksSection";
import QuickActionsSection from "../components/QuickActionsSection";
import QuickStatsSection from "../components/QuickStatsSection";
import {
  Settings,
  LogOut,
  ArrowLeft,
  Smartphone,
  Menu,
  X,
  HelpCircle,
  User,
  Sun,
  Moon,
} from "lucide-react";
// import ThemeToggle from "../components/ThemeToggle";

function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    userDetails,
    signOut,
    getUserDetails,
    getSocialLinks,
    getProfileDetails,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasLoadedData = useRef(false);

  // Single useEffect to handle all data loading
  useEffect(() => {
    const loadAllData = async () => {
      // Prevent multiple loads
      if (hasLoadedData.current || !user?.id) {
        return;
      }

      try {
        // Step 1: Get user details if not already loaded
        if (!userDetails) {
          console.log("Loading user details...");
          const { data, error } = await getUserDetails(user.id);
          if (error) {
            console.error("Error fetching user details:", error);
            return;
          }
          
          // Check for onboarding
          if (data && data.first_login === true) {
            setShowOnboarding(true);
            hasLoadedData.current = true;
            return; // Don't load other data during onboarding
          }
        }

        // Step 2: Check if already in onboarding
        if (userDetails?.first_login === true) {
          setShowOnboarding(true);
          hasLoadedData.current = true;
          return;
        }

        // Step 3: Load dashboard data (only for non-first-time users)
        if (userDetails?.first_login === false) {
          setLoadingData(true);
          console.log("Loading dashboard data...");

          // Check cache first
          const cachedSocialLinks = localStorage.getItem(`socialLinks_${user.id}`);
          const cachedProfileDetails = localStorage.getItem(`profileDetails_${user.id}`);
          const cacheTimestamp = localStorage.getItem(`cacheTimestamp_${user.id}`);

          const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 5 * 60 * 1000;

          if (isCacheValid && cachedSocialLinks && cachedProfileDetails) {
            console.log("Using cached dashboard data");
            setSocialLinks(JSON.parse(cachedSocialLinks));
            setProfileDetails(JSON.parse(cachedProfileDetails));
          } else {
            console.log("Fetching fresh dashboard data");

            // Fetch all data in parallel
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

          setLoadingData(false);
          hasLoadedData.current = true;
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoadingData(false);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userDetails]); // Only depend on user.id and userDetails to prevent infinite loops

  const handleOnboardingComplete = async () => {
    console.log("Onboarding completed, refreshing user details...");
    
    // Reset the ref to allow data loading
    hasLoadedData.current = false;
    
    // Refresh user details to get updated first_login status
    await getUserDetails(user.id);
    
    // Also refresh social links and profile details
    if (user?.id) {
      const { data: socialData } = await getSocialLinks(user.id);
      const { data: profileData } = await getProfileDetails(user.id);
      setSocialLinks(socialData || []);
      setProfileDetails(profileData);
      
      // Update cache
      localStorage.setItem(`socialLinks_${user.id}`, JSON.stringify(socialData || []));
      localStorage.setItem(`profileDetails_${user.id}`, JSON.stringify(profileData));
      localStorage.setItem(`cacheTimestamp_${user.id}`, Date.now().toString());
    }
    
    setShowOnboarding(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const handleHelpClick = () => {
    navigate("/help");
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      console.log("Dashboard: Starting sign out...");
      const { error } = await signOut();
      console.log("Dashboard: Sign out result:", { error });
      
      if (error) {
        console.error("Error signing out:", error);
        // You might want to show an error message to the user here
        return;
      }
      
      console.log("Dashboard: Sign out successful, redirecting to home");
      navigate("/");
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
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Dashboard is designed for mobile devices. Please access it from your
            phone or resize your browser window.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Mobile Dashboard - Visible only on mobile */}
      <div
        className={`md:hidden min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
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
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-lg"
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
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-primary-500 shadow-lg ${
                    userDetails?.profile_url ? "hidden" : "flex"
                } ${
                  isDark 
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-primary-100 text-primary-600"
                  }`}
                >
                  {userDetails?.name
                    ? userDetails.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
            </div>
            
            <div>
                <h1 className="text-2xl font-bold brand-font mb-2">
                Welcome to Flink
              </h1>
                <p
                  className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                {userDetails?.name || user?.email}
              </p>
              {userDetails?.name && (
                  <p
                    className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                  {user?.email}
                </p>
              )}
            </div>
          </div>

            <div className="flex items-center">
              {/* Hamburger Menu */}
              <button
                onClick={handleMenuToggle}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-gray-300 hover:text-white"
                    : "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-gray-800"
                }`}
                title="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
          </button>
            </div>
        </header>

          {/* User Status Section - Only show for new users */}
          {userDetails && userDetails.first_login && (
            <div
              className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-center">
                    <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    isDark 
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                  ✨ New User
                </span>
            </div>
          </div>
        )}

        {/* Social Links Section */}
        <div className="mb-8">
          <SocialLinksSection socialLinks={socialLinks} />
        </div>

        {/* Profile Details Section */}
        <div className="mb-8">
          <ProfileSection profileDetails={profileDetails} />
        </div>

        {/* Loading State */}
        {loadingData && (
          <div className="mb-8">
            <div
              className={`p-6 rounded-2xl text-center ${
                isDark 
                  ? "bg-slate-800/50 border border-slate-700/50" 
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Loading your profile data...
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions - Coming Soon */}
        <div className="mb-8">
          <QuickActionsSection />
        </div>

        {/* Quick Stats - Without Views */}
        <div className="mb-8">
            <QuickStatsSection
              socialLinks={socialLinks}
              profileDetails={profileDetails}
            />
          </div>

          {/* Hamburger Menu Overlay */}
          <div
            className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
              isMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleMenuClose}
            />

            {/* Menu Panel */}
            <div
              className={`absolute right-0 top-0 h-full w-80 max-w-sm transform transition-all duration-300 ease-out ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              } ${isDark ? "bg-slate-800" : "bg-white"}`}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div
                  className={`flex items-center justify-between p-6 border-b ${
                    isDark ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Menu
                  </h2>
                  <button
                    onClick={handleMenuClose}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-6">
                  <div className="space-y-2">
                    {/* Profile */}
                    <button
                      onClick={handleProfileClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-200 ${
                        isDark
                          ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile Preview</span>
                    </button>

                    {/* Settings */}
                    <button
                      onClick={handleSettingsClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-100 ${
                        isDark
                          ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>

                    {/* Help */}
                    <button
                      onClick={handleHelpClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-300 ${
                        isDark
                          ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Help & Support</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-[400ms] ${
                        isDark
                          ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-5 h-5" />
                          <span className="font-medium">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5" />
                          <span className="font-medium">Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Logout Section */}
                <div
                  className={`p-6 border-t animate-in slide-in-from-right-4 delay-400 ${
                    isDark ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/30"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
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
