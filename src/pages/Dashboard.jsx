import React, { useState, useEffect } from "react";
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
          const { data: socialData, error: socialError } = await getSocialLinks(
            user.id
          );
          if (socialError) {
            console.error("Error fetching social links:", socialError);
          } else {
            setSocialLinks(socialData || []);
          }

          // Fetch profile details
          const { data: profileData, error: profileError } =
            await getProfileDetails(user.id);
          if (profileError) {
            console.error("Error fetching profile details:", profileError);
          } else {
            setProfileDetails(profileData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [userDetails, user?.id, getSocialLinks, getProfileDetails]);

  const handleOnboardingComplete = async () => {
    console.log("Onboarding completed, refreshing user details...");
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

  const handleSettingsClick = () => {
    navigate("/settings");
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
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-lg"
                  onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                  }}
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
              <h1 className="text-3xl font-bold brand-font mb-2">
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

            <div className="flex items-center space-x-3">
              {/* Settings Icon */}
              <button
                onClick={handleSettingsClick}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-gray-300 hover:text-white"
                    : "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-gray-800"
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
          
          <button
            onClick={handleSignOut}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300"
                    : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700"
                }`}
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
          </button>
            </div>
        </header>

        {/* User Details Section */}
        {userDetails && (
            <div
              className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
              }`}
            >
            <div className="flex items-center space-x-6 mb-6">
              {/* Large Profile Picture */}
              <div className="relative">
                {userDetails?.profile_url ? (
                  <img
                    src={userDetails.profile_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-primary-500 shadow-lg ${
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
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {userDetails.name || "User Profile"}
                </h2>
                  <p
                    className={`text-lg ${
                  isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                  {userDetails.email || user?.email}
                </p>
                {userDetails.first_login && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    isDark 
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                    First Login
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <span
                    className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                  User ID:
                </span>
                  <p className={`${isDark ? "text-white" : "text-gray-800"}`}>
                  {userDetails.id}
                </p>
              </div>
              <div>
                  <span
                    className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                  Email:
                </span>
                  <p className={`${isDark ? "text-white" : "text-gray-800"}`}>
                  {userDetails.email || user?.email}
                </p>
              </div>
              {userDetails.profile_url && (
                <div>
                    <span
                      className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                    Profile URL:
                  </span>
                    <p className={`${isDark ? "text-white" : "text-gray-800"}`}>
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
                    <span
                      className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                    Created At:
                  </span>
                    <p className={`${isDark ? "text-white" : "text-gray-800"}`}>
                    {new Date(userDetails.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
                <pre
                  className={`text-xs p-4 rounded-lg overflow-auto ${
                isDark 
                  ? "bg-slate-900 text-gray-300" 
                  : "bg-gray-100 text-gray-700"
                  }`}
                >
                {JSON.stringify(userDetails, null, 2)}
              </pre>
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
          <QuickStatsSection socialLinks={socialLinks} profileDetails={profileDetails} />
        </div>
      </div>
      </div>
    </>
  );
}

export default Dashboard;
