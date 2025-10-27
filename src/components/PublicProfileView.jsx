import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import BackgroundPattern from "./BackgroundPattern";
import { supabase } from "../lib/supabase";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  removeConnection,
  canViewProfile,
  CONNECTION_STATUS 
} from "../lib/connections";
import {
  ArrowLeft,
  User,
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
  ExternalLink,
  Lock,
  Smartphone,
  Send,
  BookOpen,
  Music,
} from "lucide-react";

const PublicProfileView = ({ handle }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Helper function to get social media icon
  const getSocialIcon = (platform) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      whatsapp: <MessageCircle className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      snapchat: <MessageCircle className="w-4 h-4" />,
      discord: <MessageCircle className="w-4 h-4" />,
      twitch: <Gamepad2 className="w-4 h-4" />,
      telegram: <Send className="w-4 h-4" />,
      reddit: <MessageCircle className="w-4 h-4" />,
      spotify: <Music className="w-4 h-4" />,
      medium: <BookOpen className="w-4 h-4" />,
      threads: <Twitter className="w-4 h-4" />,
    };
    return icons[platform] || <ExternalLink className="w-4 h-4" />;
  };

  // Helper function to get social media name
  const getSocialName = (platform) => {
    const names = {
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      github: "GitHub",
      youtube: "YouTube",
      facebook: "Facebook",
      snapchat: "Snapchat",
      discord: "Discord",
      twitch: "Twitch",
      telegram: "Telegram",
      reddit: "Reddit",
      spotify: "Spotify",
      medium: "Medium",
      threads: "Threads",
    };
    return names[platform] || platform;
  };

  // Helper function to format URL for clicking
  const formatUrlForClick = (url, platform) => {
    if (platform === "email") {
      const cleanEmail = url.replace(/^mailto:/, "");
      return `mailto:${cleanEmail}`;
    } else if (platform === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`;
    } else if (platform === "whatsapp") {
      // Handle whatsapp links
      if (url.includes("wa.me/") || url.includes("whatsapp.com")) {
        return url.startsWith("http") ? url : `https://${url}`;
      }
      // Just phone number
      return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
    } else {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      const socialUrls = {
        whatsapp: (username) => {
          // Handle whatsapp links
          if (username.includes("wa.me/") || username.includes("whatsapp.com")) {
            return username.startsWith("http") ? username : `https://${username}`;
          }
          // Just phone number
          return `https://wa.me/${username.replace(/[^0-9]/g, "")}`;
        },
        telegram: (username) =>
          username.includes("t.me/") || username.includes("telegram.me/")
            ? `https://${username}`
            : `https://t.me/${username.replace("@", "")}`,
        instagram: (username) =>
          `https://instagram.com/${username.replace("@", "")}`,
        twitter: (username) =>
          `https://twitter.com/${username.replace("@", "")}`,
        linkedin: (username) =>
          username.includes("linkedin.com")
            ? `https://${username}`
            : `https://linkedin.com/in/${username}`,
        github: (username) =>
          username.includes("github.com")
            ? `https://${username}`
            : `https://github.com/${username}`,
        youtube: (username) =>
          username.includes("youtube.com")
            ? `https://${username}`
            : `https://youtube.com/@${username.replace("@", "")}`,
        facebook: (username) =>
          username.includes("facebook.com")
            ? `https://${username}`
            : `https://facebook.com/${username}`,
        snapchat: (username) =>
          `https://snapchat.com/add/${username.replace("@", "")}`,
        discord: (username) => `https://discord.com/users/${username}`,
        twitch: (username) =>
          username.includes("twitch.tv")
            ? `https://${username}`
            : `https://twitch.tv/${username}`,
      };

      if (socialUrls[platform]) {
        return socialUrls[platform](url);
      }

      return `https://${url}`;
    }
  };

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      // console.log('PublicProfileView: Loading profile for handle:', handle);
      if (!handle) {
        // console.log('PublicProfileView: No handle provided');
        setError("No profile handle provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, get the profile data from flink_profiles table using the handle
        const { data: profileData, error: profileError } = await supabase
          .from("flink_profiles")
          .select("*")
          .eq("handle", handle.toLowerCase())
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          if (profileError.code === "PGRST116") {
            // console.log('Profile not found for handle:', handle);
            setError("Profile not found");
          } else {
            // console.log('Failed to load profile for handle:', handle, 'Error:', profileError);
            setError("Failed to load profile data");
          }
          setLoading(false);
          return;
        }

        if (!profileData) {
          // console.log('No profile data found for handle:', handle);
          setError("Profile not found");
          setLoading(false);
          return;
        }

        // console.log('Profile data found:', profileData);

        // Get user details from users table (only name and created_at)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, created_at")
          .eq("id", profileData.user_id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          setError("Failed to load user data");
          setLoading(false);
          return;
        }

        // Get social links from social_links table
        const { data: socialLinksData, error: socialError } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", profileData.user_id)
          .order("created_at", { ascending: true });

        if (socialError) {
          console.error("Error fetching social links:", socialError);
          // Don't fail the entire load for social links error, just log it
        }

        // Combine profile data with user data
        const combinedProfileData = {
          ...profileData,
          name: userData.name,
          created_at: userData.created_at,
          // profile_url is now directly from flink_profiles table
        };

        // Check if user can view this profile (privacy check)
        try {
          // console.log('Checking profile access - viewerId:', user?.id, 'profileUserId:', profileData.user_id, 'isPrivate:', profileData.private);
          const { canView, connection } = await canViewProfile(
            user?.id, 
            profileData.user_id, 
            profileData.private
          );
          // console.log('Profile access result - canView:', canView, 'connection:', connection);

          if (!canView) {
            setError("This profile is private. You need to be friends to view it.");
            setLoading(false);
            return;
          }

          // Set connection status if there's a connection
          if (connection) {
            setConnectionStatus(connection);
          }
        } catch (connectionError) {
          console.error('Error checking profile access:', connectionError);
          // If connection check fails, still show the profile but without connection status
          // This prevents the entire profile from failing to load due to connection errors
        }

        // console.log('Setting profile data:', combinedProfileData);
        setProfileData(combinedProfileData);
        setSocialLinks(socialLinksData || []);

        // console.log('Profile loading completed successfully');
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile data:", err);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    loadProfileData();
  }, [handle, user]);

  const handleBack = () => {
    // Go back to the previous page in browser history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home if no history
      navigate("/");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Connection action handlers
  const handleSendRequest = async () => {
    if (!user || !profileData) return;
    
    setConnectionLoading(true);
    try {
      const { data, error } = await sendFriendRequest(user.id, profileData.user_id, profileData.private);
      if (error) {
        console.error("Error sending friend request:", error);
        // You could show a toast notification here
      } else {
        setConnectionStatus(data);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!connectionStatus) return;
    
    setConnectionLoading(true);
    try {
      const { data, error } = await acceptFriendRequest(connectionStatus.id);
      if (error) {
        console.error("Error accepting friend request:", error);
      } else {
        setConnectionStatus(data);
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!connectionStatus) return;
    
    setConnectionLoading(true);
    try {
      const { data, error } = await rejectFriendRequest(connectionStatus.id);
      if (error) {
        console.error("Error rejecting friend request:", error);
      } else {
        setConnectionStatus(data);
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!connectionStatus) return;
    
    setConnectionLoading(true);
    try {
      const { error } = await removeConnection(connectionStatus.id);
      if (error) {
        console.error("Error removing connection:", error);
      } else {
        setConnectionStatus(null);
      }
    } catch (err) {
      console.error("Error removing connection:", err);
    } finally {
      setConnectionLoading(false);
    }
  };

  // Helper function to get button text and action based on connection status
  const getConnectionButton = () => {
    if (!user || !profileData || user.id === profileData.user_id) {
      return null; // Don't show button for own profile
    }


    if (!connectionStatus) {
      // No connection exists
      return isProfilePrivate ? (
        <button
          onClick={handleSendRequest}
          disabled={connectionLoading}
          className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
            isDark
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
          }`}
        >
          {connectionLoading ? "Sending..." : "Send Request"}
        </button>
      ) : (
        <button
          onClick={handleSendRequest}
          disabled={connectionLoading}
          className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
            isDark
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
          }`}
        >
          {connectionLoading ? "Following..." : "Follow"}
        </button>
      );
    }

    // Connection exists, show appropriate button based on status
    switch (connectionStatus.status) {
      case CONNECTION_STATUS.PENDING:
        if (connectionStatus.sender_id === user.id) {
          // User sent the request
          return (
            <button
              disabled
              className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isDark
                  ? "bg-gray-600 text-gray-300"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              Request Sent
            </button>
          );
        } else {
          // User received the request
          return (
            <div className="flex space-x-2">
              <button
                onClick={handleAcceptRequest}
                disabled={connectionLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isDark
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                }`}
              >
                {connectionLoading ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={connectionLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isDark
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                }`}
              >
                {connectionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          );
        }
      case CONNECTION_STATUS.ACCEPTED:
        return (
          <div className="flex space-x-1.5">
            <button
              disabled
              className={`flex-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${
                isDark
                  ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/30"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
              }`}
            >
              ✓ Friends
            </button>
            <button
              onClick={handleUnfriend}
              disabled={connectionLoading}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                isDark
                  ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 border border-red-500/30"
                  : "bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700 border border-red-200"
              }`}
            >
              {connectionLoading ? "..." : "Unfollow"}
            </button>
          </div>
        );
      case CONNECTION_STATUS.REJECTED:
        return (
          <button
            disabled
            className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              isDark
                ? "bg-gray-600 text-gray-300"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            Request Rejected
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className={`public-profile-loading min-h-screen flex items-center justify-center ${
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

  if (error || !profileData) {
    return (
      <>
        {/* Desktop Warning Message - Hidden on mobile */}
        <div className="public-profile-error-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>

        {/* Mobile Error Content */}
        <div
          className={`min-h-screen relative md:hidden ${
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user && (
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
                      Profile
                    </h1>
                  </div>
                </div>

                {!user && (
                  <button
                    onClick={handleLogin}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-primary-600 hover:bg-primary-700 text-white"
                        : "bg-primary-600 hover:bg-primary-700 text-white"
                    }`}
                  >
                    Login
                  </button>
                )}
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
                  {error === true
                    ? "The profile you're looking for doesn't exist."
                    : error}
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
                    onClick={handleBack}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Check if profile is private - if users are friends, treat as public
  const isProfilePrivate = profileData.private && (!connectionStatus || connectionStatus.status !== 'accepted');

  return (
    <div className="public-profile-main">
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="public-profile-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div
        className={`min-h-screen relative md:hidden pt-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        <BackgroundPattern />

        {/* Header */}
        <div
          className={`sticky top-0 z-10 ${
            isDark ? "border-slate-700" : " border-gray-200"
          }`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user && (
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
                    {profileData.name}
                  </h1>
                </div>
              </div>

              {!user && (
                <button
                  onClick={handleLogin}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-2 max-w-4xl md:hidden">
            {/* Profile Header Card */}
            <div
              className={`relative overflow-hidden rounded-3xl mb-8 ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
                  : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
              }`}
            >
              <div className="relative p-4">
                <div className="flex flex-col md:flex-row items-center md:items-center space-y-6 md:space-y-0 md:space-x-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    {profileData.profile_url ? (
                      <img
                        src={profileData.profile_url}
                        alt="Profile"
                        loading="lazy"
                        decoding="async"
                        className={`w-32 h-32 rounded-full object-cover ${profileData.handle === "basava44" ? "ring-4 ring-yellow-400" : "border-4 border-white/20"} shadow-2xl`}
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
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl ${
                        profileData.profile_url ? "hidden" : "flex"
                      } ${profileData.handle === "basava44" ? "ring-4 ring-yellow-400" : "border-4 border-white/20"} ${
                        isDark
                          ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                      }`}
                    >
                      {profileData.name
                        ? profileData.name.charAt(0).toUpperCase()
                        : profileData.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-center">
                    <h1
                      className={`text-2xl font-bold mb-3 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {profileData.name}
                    </h1>

                    {/* Founder Tag - Show for basava44 */}
                    {profileData.handle === "basava44" && (
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            isDark
                              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-300"
                          }`}
                        >
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          Founder
                        </span>
                      </div>
                    )}

                    {/* Bio - Show for both private and public profiles */}
                    {profileData.bio && (
                      <p
                        className={`text-sm mb-4 max-w-2xl ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {profileData.bio}
                      </p>
                    )}

                    {/* Profile Stats */}
                    {!isProfilePrivate && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {profileData.location && (
                          <div
                            className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${
                              isDark
                                ? "bg-slate-700/50 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">
                              {profileData.location}
                            </span>
                          </div>
                        )}

                        {profileData.website && (
                          <div
                            className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${
                              isDark
                                ? "bg-slate-700/50 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Globe className="w-3 h-3" />
                            <a
                              href={
                                profileData.website.startsWith("http")
                                  ? profileData.website
                                  : `https://${profileData.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}

                        <div
                          className={`flex items-center space-x-1.5 px-2 py-1 my-2 rounded-full ${
                            isDark
                              ? "bg-slate-700/50 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">
                            Joined{" "}
                            {profileData.created_at
                              ? new Date(
                                  profileData.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Flink Profile Link */}
                    <div
                      className={`mt-3 p-0 rounded-lg ${
                        isDark
                          ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30"
                          : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                      }`}
                    >
                      <a
                        href={`https://flink.to/${profileData.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-1.5 text-xs font-medium hover:scale-105 transition-transform duration-200 ${
                          isDark
                            ? "text-blue-300 hover:text-blue-200"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        <span>flink.to/{profileData.handle}</span>
                      </a>
                    </div>

                    {/* Connection Button */}
                    <div className="mt-4">
                      {getConnectionButton()}
                    </div>

                    {/* Login Prompt for Non-logged-in Users */}
                    {!user && (
                      <div className="mt-4">
                        <button
                          onClick={handleLogin}
                          className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                            isDark
                              ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-600"
                              : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300"
                          }`}
                        >
                          Login to Follow
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Private Profile Message */}
            {isProfilePrivate && (
              <div
                className={`mb-6 p-6 rounded-2xl text-center ${
                  isDark
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Private Profile
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  This profile is private. Only the connected account can view
                  the details and social links.
                </p>
              </div>
            )}

            {/* Social Links Grid - Only show if profile is not private */}
            {socialLinks.length > 0 && !isProfilePrivate && (
              <div
                className={`p-6 rounded-2xl mb-8 ${
                  isDark
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-xl font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Connect With Me
                  </h2>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDark
                        ? "bg-slate-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {socialLinks.length === 1 ? "Link" : "Links"}
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {socialLinks.map((link, index) => {
                    const clickUrl = formatUrlForClick(link.url, link.platform);

                    // Platform-specific colors (matching SocialLinksSection styling)
                    const getPlatformColors = (platform) => {
                      const colors = {
                        email: {
                          bg: isDark
                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5"
                            : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
                          border: isDark ? "border-blue-400/20" : "border-blue-200",
                          icon: isDark ? "text-blue-300" : "text-blue-600",
                          hover: isDark
                            ? "hover:from-blue-500/15 hover:to-blue-600/10"
                            : "hover:from-blue-100/90 hover:to-blue-200/80",
                          shadow: isDark ? "shadow-blue-500/10" : "shadow-blue-200/30",
                        },
                        phone: {
                          bg: isDark
                            ? "bg-gradient-to-br from-green-500/10 to-green-600/5"
                            : "bg-gradient-to-br from-green-50/80 to-green-100/60",
                          border: isDark ? "border-green-400/20" : "border-green-200",
                          icon: isDark ? "text-green-300" : "text-green-600",
                          hover: isDark
                            ? "hover:from-green-500/15 hover:to-green-600/10"
                            : "hover:from-green-100/90 hover:to-green-200/80",
                          shadow: isDark ? "shadow-green-500/10" : "shadow-green-200/30",
                        },
                        whatsapp: {
                          bg: isDark
                            ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"
                            : "bg-gradient-to-br from-emerald-50/80 to-emerald-100/60",
                          border: isDark ? "border-emerald-400/20" : "border-emerald-200",
                          icon: isDark ? "text-emerald-300" : "text-emerald-600",
                          hover: isDark
                            ? "hover:from-emerald-500/15 hover:to-emerald-600/10"
                            : "hover:from-emerald-100/90 hover:to-emerald-200/80",
                          shadow: isDark ? "shadow-emerald-500/10" : "shadow-emerald-200/30",
                        },
                        instagram: {
                          bg: isDark
                            ? "bg-gradient-to-br from-pink-500/10 to-rose-500/5"
                            : "bg-gradient-to-br from-pink-50/80 to-rose-100/60",
                          border: isDark ? "border-pink-400/20" : "border-pink-200",
                          icon: isDark ? "text-pink-300" : "text-pink-600",
                          hover: isDark
                            ? "hover:from-pink-500/15 hover:to-rose-500/10"
                            : "hover:from-pink-100/90 hover:to-rose-200/80",
                          shadow: isDark ? "shadow-pink-500/10" : "shadow-pink-200/30",
                        },
                        twitter: {
                          bg: isDark
                            ? "bg-gradient-to-br from-sky-500/10 to-cyan-500/5"
                            : "bg-gradient-to-br from-sky-50/80 to-cyan-100/60",
                          border: isDark ? "border-sky-400/20" : "border-sky-200",
                          icon: isDark ? "text-sky-300" : "text-sky-600",
                          hover: isDark
                            ? "hover:from-sky-500/15 hover:to-cyan-500/10"
                            : "hover:from-sky-100/90 hover:to-cyan-200/80",
                          shadow: isDark ? "shadow-sky-500/10" : "shadow-sky-200/30",
                        },
                        linkedin: {
                          bg: isDark
                            ? "bg-gradient-to-br from-blue-600/10 to-blue-700/5"
                            : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
                          border: isDark ? "border-blue-400/20" : "border-blue-200",
                          icon: isDark ? "text-blue-300" : "text-blue-700",
                          hover: isDark
                            ? "hover:from-blue-600/15 hover:to-blue-700/10"
                            : "hover:from-blue-100/90 hover:to-blue-200/80",
                          shadow: isDark ? "shadow-blue-600/10" : "shadow-blue-200/30",
                        },
                        github: {
                          bg: isDark
                            ? "bg-gradient-to-br from-gray-600/10 to-gray-700/5"
                            : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
                          border: isDark ? "border-gray-400/20" : "border-gray-200",
                          icon: isDark ? "text-gray-300" : "text-gray-700",
                          hover: isDark
                            ? "hover:from-gray-600/15 hover:to-gray-700/10"
                            : "hover:from-gray-100/90 hover:to-gray-200/80",
                          shadow: isDark ? "shadow-gray-600/10" : "shadow-gray-200/30",
                        },
                        youtube: {
                          bg: isDark
                            ? "bg-gradient-to-br from-red-500/10 to-red-600/5"
                            : "bg-gradient-to-br from-red-50/80 to-red-100/60",
                          border: isDark ? "border-red-400/20" : "border-red-200",
                          icon: isDark ? "text-red-300" : "text-red-600",
                          hover: isDark
                            ? "hover:from-red-500/15 hover:to-red-600/10"
                            : "hover:from-red-100/90 hover:to-red-200/80",
                          shadow: isDark ? "shadow-red-500/10" : "shadow-red-200/30",
                        },
                        facebook: {
                          bg: isDark
                            ? "bg-gradient-to-br from-blue-700/10 to-blue-800/5"
                            : "bg-gradient-to-br from-blue-50/80 to-blue-100/60",
                          border: isDark ? "border-blue-500/20" : "border-blue-200",
                          icon: isDark ? "text-blue-300" : "text-blue-700",
                          hover: isDark
                            ? "hover:from-blue-700/15 hover:to-blue-800/10"
                            : "hover:from-blue-100/90 hover:to-blue-200/80",
                          shadow: isDark ? "shadow-blue-700/10" : "shadow-blue-200/30",
                        },
                        snapchat: {
                          bg: isDark
                            ? "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
                            : "bg-gradient-to-br from-yellow-50/80 to-yellow-100/60",
                          border: isDark ? "border-yellow-400/20" : "border-yellow-200",
                          icon: isDark ? "text-yellow-300" : "text-yellow-600",
                          hover: isDark
                            ? "hover:from-yellow-500/15 hover:to-yellow-600/10"
                            : "hover:from-yellow-100/90 hover:to-yellow-200/80",
                          shadow: isDark ? "shadow-yellow-500/10" : "shadow-yellow-200/30",
                        },
                        discord: {
                          bg: isDark
                            ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5"
                            : "bg-gradient-to-br from-indigo-50/80 to-indigo-100/60",
                          border: isDark ? "border-indigo-400/20" : "border-indigo-200",
                          icon: isDark ? "text-indigo-300" : "text-indigo-600",
                          hover: isDark
                            ? "hover:from-indigo-500/15 hover:to-indigo-600/10"
                            : "hover:from-indigo-100/90 hover:to-indigo-200/80",
                          shadow: isDark ? "shadow-indigo-500/10" : "shadow-indigo-200/30",
                        },
                        twitch: {
                          bg: isDark
                            ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5"
                            : "bg-gradient-to-br from-purple-50/80 to-purple-100/60",
                          border: isDark ? "border-purple-400/20" : "border-purple-200",
                          icon: isDark ? "text-purple-300" : "text-purple-600",
                          hover: isDark
                            ? "hover:from-purple-500/15 hover:to-purple-600/10"
                            : "hover:from-purple-100/90 hover:to-purple-200/80",
                          shadow: isDark ? "shadow-purple-500/10" : "shadow-purple-200/30",
                        },
                        telegram: {
                          bg: isDark
                            ? "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"
                            : "bg-gradient-to-br from-cyan-50/80 to-cyan-100/60",
                          border: isDark ? "border-cyan-400/20" : "border-cyan-200",
                          icon: isDark ? "text-cyan-300" : "text-cyan-600",
                          hover: isDark
                            ? "hover:from-cyan-500/15 hover:to-cyan-600/10"
                            : "hover:from-cyan-100/90 hover:to-cyan-200/80",
                          shadow: isDark ? "shadow-cyan-500/10" : "shadow-cyan-200/30",
                        },
                        reddit: {
                          bg: isDark
                            ? "bg-gradient-to-br from-orange-500/10 to-orange-600/5"
                            : "bg-gradient-to-br from-orange-50/80 to-orange-100/60",
                          border: isDark ? "border-orange-400/20" : "border-orange-200",
                          icon: isDark ? "text-orange-300" : "text-orange-600",
                          hover: isDark
                            ? "hover:from-orange-500/15 hover:to-orange-600/10"
                            : "hover:from-orange-100/90 hover:to-orange-200/80",
                          shadow: isDark ? "shadow-orange-500/10" : "shadow-orange-200/30",
                        },
                        spotify: {
                          bg: isDark
                            ? "bg-gradient-to-br from-green-600/10 to-green-700/5"
                            : "bg-gradient-to-br from-green-50/80 to-green-100/60",
                          border: isDark ? "border-green-500/20" : "border-green-300",
                          icon: isDark ? "text-green-300" : "text-green-600",
                          hover: isDark
                            ? "hover:from-green-600/15 hover:to-green-700/10"
                            : "hover:from-green-100/90 hover:to-green-200/80",
                          shadow: isDark ? "shadow-green-600/10" : "shadow-green-300/30",
                        },
                        medium: {
                          bg: isDark
                            ? "bg-gradient-to-br from-gray-700/10 to-gray-800/5"
                            : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
                          border: isDark ? "border-gray-500/20" : "border-gray-300",
                          icon: isDark ? "text-gray-300" : "text-gray-700",
                          hover: isDark
                            ? "hover:from-gray-700/15 hover:to-gray-800/10"
                            : "hover:from-gray-100/90 hover:to-gray-200/80",
                          shadow: isDark ? "shadow-gray-700/10" : "shadow-gray-300/30",
                        },
                        threads: {
                          bg: isDark
                            ? "bg-gradient-to-br from-slate-500/10 to-slate-600/5"
                            : "bg-gradient-to-br from-slate-50/80 to-slate-100/60",
                          border: isDark ? "border-slate-400/20" : "border-slate-200",
                          icon: isDark ? "text-slate-300" : "text-slate-600",
                          hover: isDark
                            ? "hover:from-slate-500/15 hover:to-slate-600/10"
                            : "hover:from-slate-100/90 hover:to-slate-200/80",
                          shadow: isDark ? "shadow-slate-500/10" : "shadow-slate-200/30",
                        },
                      };
                      return (
                        colors[platform] || {
                          bg: isDark
                            ? "bg-gradient-to-br from-gray-500/10 to-gray-600/5"
                            : "bg-gradient-to-br from-gray-50/80 to-gray-100/60",
                          border: isDark ? "border-gray-400/20" : "border-gray-200",
                          icon: isDark ? "text-gray-300" : "text-gray-600",
                          hover: isDark
                            ? "hover:from-gray-500/15 hover:to-gray-600/10"
                            : "hover:from-gray-100/90 hover:to-gray-200/80",
                          shadow: isDark ? "shadow-gray-500/10" : "shadow-gray-200/30",
                        }
                      );
                    };

                    const platformColors = getPlatformColors(link.platform);

                    return (
                      <a
                        key={index}
                        href={clickUrl}
                        target={
                          link.platform === "email" || link.platform === "phone" || link.platform === "whatsapp" || link.platform === "telegram"
                            ? "_self"
                            : "_blank"
                        }
                        rel={
                          link.platform === "email" || link.platform === "phone" || link.platform === "whatsapp" || link.platform === "telegram"
                            ? ""
                            : "noopener noreferrer"
                        }
                        className={`group p-3 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${platformColors.bg} ${platformColors.border} ${platformColors.hover} ${platformColors.shadow} shadow-lg`}
                      >
                        <div className="flex flex-col items-center text-center">
                          {/* Platform Icon */}
                          <div className={`${platformColors.icon} mb-2 flex justify-center group-hover:scale-110 transition-transform duration-200`}>
                            {getSocialIcon(link.platform)}
                          </div>

                          {/* Platform Name */}
                          <div className="min-w-0 w-full">
                            <p
                              className={`font-medium text-xs ${
                                isDark ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {getSocialName(link.platform)}
                            </p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer with Flink Branding */}
            <div className="mt-6 mb-2">
              <div
                className={`text-center ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <div className="text-xs opacity-60">
                  Made with ❤️ by{" "}
                  <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Flink
                  </span>
                </div>
                <div className="text-xs opacity-50 mt-1">
                  © 2025 Flink. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;
