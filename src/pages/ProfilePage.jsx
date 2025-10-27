import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "../lib/supabase";
import { getUserConnections, getPendingRequests } from "../lib/connections";
import OnboardingFlow from "../components/OnboardingFlow";
import ProfileSection from "../components/ProfileSection";
import SocialLinksSection from "../components/SocialLinksSection";
import QuickActionsSection from "../components/QuickActionsSection";
import QuickStatsSection from "../components/QuickStatsSection";
import BackgroundPattern from "../components/BackgroundPattern";
import PublicProfileView from "../components/PublicProfileView";
import SearchOverlay from "../components/SearchOverlay";
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
  Bell,
  Search,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Users,
} from "lucide-react";

function ProfilePage() {
  const { handle } = useParams();
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

  // State for profile checking
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // State for own profile (dashboard content)
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [friends, setFriends] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Ref to prevent multiple data loads
  const hasLoadedData = useRef(false);
  
  // Ref to prevent double sign out calls
  const isSigningOut = useRef(false);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    if (isSigningOut.current) {
      // console.log("Sign out already in progress, ignoring duplicate call");
      return;
    }
    
    isSigningOut.current = true;
    
    try {
      // console.log("handleSignOut called");
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
        alert("Error signing out: " + error.message);
        return;
      }
      // console.log("Sign out successful, navigating to home");
      
      // Try multiple navigation methods for mobile compatibility
      try {
        navigate("/");
      } catch (navError) {
        // console.log("Navigate failed, trying window.location:", navError);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      alert("Unexpected error: " + error.message);
    } finally {
      isSigningOut.current = false;
    }
  }, [signOut, navigate]);

  // Handle navigation when user signs out (but not when accessing public profile directly)
  useEffect(() => {
    // Only redirect if user was previously logged in and then signed out
    // Don't redirect if user is null from the start (direct profile access)
    if (user === null && !isCheckingProfile) {
      // Check if this is a public profile access (whether profile exists or not)
      if (!isOwnProfile) {
        // This is a public profile access, don't redirect
        // Let the component handle showing 404 or profile content
        return;
      }
      // User has signed out, redirect to home
      navigate("/", { replace: true });
    }
  }, [user, navigate, isCheckingProfile, isOwnProfile]);

  // Check if this is the user's own profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!handle) {
        setProfileExists(false);
        setIsCheckingProfile(false);
        return;
      }

      // Don't check if user is not loaded yet
      if (user === undefined) {
        return;
      }

      setIsCheckingProfile(true);

      try {
        // Check if handle is actually a user ID (UUID format)
        const isUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);
        
        let profileData = null;
        let profileError = null;

        if (isUserId) {
          // If handle is a user ID, check if it's the current user's ID
          if (user && user.id === handle) {
            // This is the current user accessing their own profile by ID
            // Check if they have a profile handle
            const { data: userProfile } = await supabase
              .from("flink_profiles")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (userProfile) {
              // User has a profile, redirect to their handle
              navigate(`/${userProfile.handle}`, { replace: true });
              return;
            } else {
              // User doesn't have a profile yet, show their own profile (dashboard)
              profileData = { user_id: user.id, handle: user.id };
              setIsOwnProfile(true);
              setProfileExists(true);
              setIsCheckingProfile(false);
              return;
            }
          } else {
            // This is someone else's user ID, profile doesn't exist
            setProfileExists(false);
            setIsCheckingProfile(false);
            return;
          }
        } else {
          // Handle is a regular profile handle, search for it
          try {
            const result = await supabase
              .from("flink_profiles")
              .select("*")
              .eq("handle", handle.toLowerCase())
              .maybeSingle();

            profileData = result.data;
            profileError = result.error;
          } catch (queryError) {
            console.error("Query failed, trying fallback approach:", queryError);
            // Fallback: get all profiles and search manually
            const { data: allProfiles } = await supabase
              .from("flink_profiles")
              .select("user_id, handle")
              .limit(10);
            
            const matchingProfile = allProfiles?.find(
              (p) => p.handle.toLowerCase() === handle.toLowerCase()
            );
            if (matchingProfile) {
              profileData = matchingProfile;
              profileError = null;
            } else {
              profileError = { message: "Profile not found via fallback" };
            }
          }

          if (profileError || !profileData) {
            setProfileExists(false);
            setIsCheckingProfile(false);
            return;
          }

          // Check if it's the user's own profile
          if (user && user.id === profileData.user_id) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
        }

        setProfileExists(true);
      } catch (err) {
        console.error("Error checking profile:", err);
        setProfileExists(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [handle, user, navigate]);

  // Load connection stats for dashboard
  const loadConnectionStats = useCallback(async () => {
    if (!user?.id) return;

    try {
        const [friendsResult, pendingResult] = await Promise.all([
        getUserConnections(user.id),
        getPendingRequests(user.id)
      ]);

      // Set friends count
      if (friendsResult.data) {
        setFriends(friendsResult.data.length);
      }

      // Set pending requests count (incoming)
      if (pendingResult.data) {
        setPendingRequests(pendingResult.data.length);
      }
    } catch (error) {
      console.error("Error loading connection stats:", error);
    }
  }, [user?.id]);

  // Load dashboard data for own profile
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Check cache first
      const cachedSocialLinks = localStorage.getItem(`socialLinks_${user.id}`);
        const cachedProfileDetails = localStorage.getItem(
          `profileDetails_${user.id}`
        );
      const cacheTimestamp = localStorage.getItem(`cacheTimestamp_${user.id}`);

        const isCacheValid =
        cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 5 * 60 * 1000;

        if (isCacheValid && cachedSocialLinks && cachedProfileDetails) {
          setSocialLinks(JSON.parse(cachedSocialLinks));
          setProfileDetails(JSON.parse(cachedProfileDetails));
        } else {
        // Fetch all data in parallel
          const [socialResult, profileResult] = await Promise.all([
            getSocialLinks(user.id),
            getProfileDetails(user.id),
          ]);

          if (!socialResult.error) {
            setSocialLinks(socialResult.data || []);
            localStorage.setItem(
              `socialLinks_${user.id}`,
              JSON.stringify(socialResult.data || [])
            );
          }

          if (!profileResult.error) {
            setProfileDetails(profileResult.data);
            localStorage.setItem(
              `profileDetails_${user.id}`,
              JSON.stringify(profileResult.data)
            );
          }

          localStorage.setItem(
            `cacheTimestamp_${user.id}`,
            Date.now().toString()
          );
        }

      // Load user details (this doesn't need caching as it's handled by AuthContext)
      await getUserDetails(user.id);
      } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, [user?.id, getSocialLinks, getProfileDetails, getUserDetails]);

  // Load dashboard data when it's own profile
  useEffect(() => {
    if (isOwnProfile && user?.id && !hasLoadedData.current) {
      loadDashboardData();
      loadConnectionStats(); // Load connection stats for quick stats
      hasLoadedData.current = true;
    }
  }, [isOwnProfile, user?.id, loadDashboardData, loadConnectionStats]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    // Clear cache to force fresh data load
    if (user?.id) {
      localStorage.removeItem(`socialLinks_${user.id}`);
      localStorage.removeItem(`profileDetails_${user.id}`);
      localStorage.removeItem(`cacheTimestamp_${user.id}`);
    }
    await loadDashboardData();
    await loadConnectionStats();
  };

  // Handle social links update
  const handleSocialLinksUpdate = async () => {
    // Clear cache to force fresh data load
    if (user?.id) {
      localStorage.removeItem(`socialLinks_${user.id}`);
      localStorage.removeItem(`cacheTimestamp_${user.id}`);
    }
    await loadDashboardData();
    await loadConnectionStats();
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    // Clear cache to force fresh data load
    if (user?.id) {
      localStorage.removeItem(`profileDetails_${user.id}`);
      localStorage.removeItem(`cacheTimestamp_${user.id}`);
    }
    await loadDashboardData();
    await loadConnectionStats();
  };

  // Search functions
  const openSearchOverlay = () => {
    setShowSearch(true);
  };

  const closeSearchOverlay = () => {
    setShowSearch(false);
  };

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div
        className={`profile-page-loading min-h-screen flex items-center justify-center ${
          isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Show 404 if profile doesn't exist
  if (!profileExists) {
    return (
      <>
        {/* Desktop Warning Message - Hidden on mobile */}
        <div className="profile-page-not-found-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Profile is designed for mobile devices. Please access it from your
            phone or resize your browser window.
          </p>
          <button
              onClick={() => navigate("/", { replace: true })}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>

        {/* Mobile Error Content */}
        <div
          className={`profile-page-not-found-mobile min-h-screen relative md:hidden ${
            isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
          }`}
        >
        <BackgroundPattern />

      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Only show back button if user is logged in */}
            {user && (
              <button
                onClick={() => navigate("/", { replace: true })}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              <User
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <h1
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                    Profile Not Found
              </h1>
            </div>
          </div>
        </div>
      </div>

          {/* Error Content */}
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              {/* Error Icon */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Error Message */}
              <div className="max-w-md mx-auto">
                <h1
                  className={`text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Profile Not Found
                </h1>
                <p
                  className={`text-lg mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  The profile you're looking for doesn't exist.
                </p>
                <p
                  className={`text-sm mb-8 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  The handle "{handle}" might be incorrect or the profile might
                  have been removed.
                </p>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Go Back Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show public profile view for other users
  if (!isOwnProfile) {
    return <PublicProfileView handle={handle} />;
  }

  // Show own profile (dashboard) for logged-in user
  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="profile-page-dashboard-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            Go to Home
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div
        className={`profile-page-dashboard-mobile min-h-screen relative md:hidden ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        <BackgroundPattern />

        {/* Header - Old Dashboard Style for Own Profile */}
        <div className="container mx-auto px-4 pt-6 pb-2 relative z-10">
          <header className="flex justify-between items-center mb-2 min-h-[80px]">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {userDetails?.profile_url ? (
                  <img
                    src={userDetails.profile_url}
                    alt="Profile"
                    loading="lazy"
                    decoding="async"
                    className="w-18 h-18 rounded-full object-cover border-2 border-primary-500 shadow-lg"
                    onLoad={(e) => {
                      e.target.style.opacity = "1";
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                    style={{
                      opacity: 0,
                      transition: "opacity 0.1s ease-in-out",
                    }}
                  />
                ) : null}
                <div
                  className={`w-18 h-18 rounded-full flex items-center justify-center text-xl font-bold border-2 border-primary-500 shadow-lg ${
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

              <div className="flex-1 min-w-0">
                <p
                  className={`text-base font-medium truncate ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                  title={userDetails?.name || user?.email}
                >
                  {userDetails?.name || user?.email}
                </p>
                {userDetails?.name && (
                  <p
                    className={`text-xs truncate ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                )}
                {/* Flink Branding */}
                <div className="flex items-center mt-1">
                  <span
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Powered by
                  </span>
                  <span
                    className={`ml-1 text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent`}
                  >
                    Flink
                      </span>
                    </div>
          </div>
        </div>

            {/* Only show search and menu buttons if not in onboarding */}
            {userDetails && !userDetails.first_login && (
              <div className="flex items-center space-x-2">
                {/* Search Button */}
                <button
                  onClick={openSearchOverlay}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                isDark 
                      ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-gray-300 hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-gray-800"
                  }`}
                  title="Search Profiles"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            )}
          </header>
          </div>

        {/* Mobile Menu - Dashboard Style */}
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
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-80 max-w-sm transform transition-all duration-300 ease-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            } ${isDark ? "bg-slate-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
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
                  onClick={() => setIsMenuOpen(false)}
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
                  {/* Profile Preview */}
                  {/* <button
                    onClick={() => {
                      navigate(`/${profileDetails?.handle || user?.id}`);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-200 ${
                      isDark
                        ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile Preview</span>
                  </button> */}

                  {/* Settings */}
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-100 ${
                      isDark
                        ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </button>

                  {/* Notifications */}
                  {/* <button
                    onClick={() => {
                      navigate("/notifications");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-300 ${
                      isDark
                        ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                  </button> */}

                  {/* Friends */}
                  <button
                    onClick={() => {
                      navigate("/friends");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-[350ms] ${
                      isDark
                        ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Friends</span>
                  </button>

                  {/* Help */}
                  <button
                    onClick={() => {
                      navigate("/help");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-[450ms] ${
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 animate-in slide-in-from-right-4 delay-[550ms] ${
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
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // console.log("Mobile sign out touch end - calling handleSignOut");
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // console.log("Mobile sign out button clicked (fallback)");
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
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

        {/* Content */}
        <div className="container mx-auto px-4 py-0 max-w-4xl md:hidden">
          {/* Show onboarding if first login */}
          {userDetails?.first_login && (
            <OnboardingFlow
              key={`onboarding-${user?.id}`}
              onComplete={handleOnboardingComplete}
              userName={userDetails?.name || user?.email || ""}
              userEmail={userDetails?.email || user?.email || ""}
              userId={user?.id || ""}
            />
          )}

          {/* Dashboard Content */}
          {userDetails && !userDetails.first_login && (
            <>
              {/* Social Links Section */}
              <SocialLinksSection
                socialLinks={socialLinks}
                profileDetails={profileDetails}
                onUpdate={handleSocialLinksUpdate}
              />

              {/* Spacing between sections */}
              <div className="mb-6"></div>

              {/* Profile Section */}
              <ProfileSection
                userDetails={userDetails}
                profileDetails={profileDetails}
                onUpdate={handleProfileUpdate}
              />

              {/* Spacing between Flink Profile and Quick Actions */}
              <div className="mb-6"></div>

              {/* Quick Actions Section */}
              <QuickActionsSection profileDetails={profileDetails} />

              {/* Quick Stats Section */}
              <QuickStatsSection 
                socialLinks={socialLinks} 
                profileDetails={profileDetails}
                friends={friends}
                pendingRequests={pendingRequests}
              />

              {/* Footer */}
              <div className="text-center mt-8 mb-4">
                <p className="text-sm mb-2 text-gray-500">
              Made with ❤️ by{" "}
              <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Flink
              </span>
                </p>
                <p className="text-xs text-gray-500">
              © 2025 Flink. All rights reserved.
                </p>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={showSearch} onClose={closeSearchOverlay} />
    </>
  );
}

export default ProfilePage;
