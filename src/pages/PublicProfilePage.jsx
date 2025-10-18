import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import BackgroundPattern from "../components/BackgroundPattern";
import { supabase } from "../lib/supabase";
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
} from "lucide-react";

const PublicProfilePage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get social media icon
  const getSocialIcon = (platform) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      snapchat: <MessageCircle className="w-4 h-4" />,
      discord: <MessageCircle className="w-4 h-4" />,
      twitch: <Gamepad2 className="w-4 h-4" />,
    };
    return icons[platform] || <ExternalLink className="w-4 h-4" />;
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
      const cleanEmail = url.replace(/^mailto:/, "");
      return `mailto:${cleanEmail}`;
    } else if (platform === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`;
    } else {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      const socialUrls = {
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
      if (!handle) {
        setError("No profile handle provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // console.log(`Loading profile data for handle: ${handle}`);
        
        // First, get the profile data from flink_profiles table using the handle
        const { data: profileData, error: profileError } = await supabase
          .from('flink_profiles')
          .select('*')
          .eq('handle', handle.toLowerCase())
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code === 'PGRST116') {
            setError("Profile not found");
          } else {
            setError("Failed to load profile data");
          }
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        // Get user details from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, profile_url, created_at')
          .eq('id', profileData.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          setError("Failed to load user data");
          setLoading(false);
          return;
        }

        // Get social links from social_links table
        const { data: socialLinksData, error: socialError } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('created_at', { ascending: true });

        if (socialError) {
          console.error('Error fetching social links:', socialError);
          // Don't fail the entire load for social links error, just log it
        }

        // Combine profile data with user data
        const combinedProfileData = {
          ...profileData,
          name: userData.name,
          profile_url: userData.profile_url,
          created_at: userData.created_at,
        };

        setProfileData(combinedProfileData);
        setSocialLinks(socialLinksData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile data:", err);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    loadProfileData();
  }, [handle]);

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
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
        <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
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
                {error === true ? "The profile you're looking for doesn't exist." : error}
              </p>
              <p
                className={`text-sm mb-8 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                The handle "{handle}" might be incorrect or the profile might have been removed.
              </p>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleBack}
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

  // Check if profile is private
  const isProfilePrivate = profileData.private;

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
        className={`min-h-screen relative md:hidden ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        <BackgroundPattern />
        
        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b ${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
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
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 max-w-4xl md:hidden">
          {/* Profile Header Card */}
          <div
            className={`relative overflow-hidden rounded-3xl mb-8 ${
              isDark
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
            }`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full transform -translate-x-24 translate-y-24"></div>
            </div>

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
                      className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
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
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/20 shadow-2xl ${
                      profileData.profile_url ? "hidden" : "flex"
                    } ${
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
                          <span className="text-xs">{profileData.location}</span>
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
                            ? new Date(profileData.created_at).toLocaleDateString(
                                "en-US",
                                { month: "long", year: "numeric" }
                              )
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Flink Profile Link */}
                  <div className={`mt-4 p-3 rounded-xl ${
                    isDark 
                      ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30" 
                      : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                  }`}>
                    <a
                      href={`https://flink.to/${profileData.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 text-sm font-semibold hover:scale-105 transition-transform duration-200 ${
                        isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>flink.to/{profileData.handle}</span>
                    </a>
                  </div>

                  {/* Follow/Request Button */}
                  {user && (
                    <div className="mt-4">
                      {isProfilePrivate ? (
                        <button
                          onClick={() => {
                            // TODO: Implement send request functionality
                            console.log("Send request to", profileData.handle);
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                            isDark
                              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                          }`}
                        >
                          Send Request
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            // TODO: Implement follow functionality
                            console.log("Follow", profileData.handle);
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                            isDark
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                          }`}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  )}

                  {/* Login Prompt for Non-logged-in Users */}
                  {!user && (
                    <div className="mt-4">
                      <button
                        onClick={() => navigate("/login")}
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
                This profile is private. Only the owner can view the details and social links.
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

                  // Platform-specific colors
                  const getPlatformColor = (platform) => {
                    const colors = {
                      email: isDark
                        ? "text-blue-400 bg-blue-500/20"
                        : "text-blue-600 bg-blue-100",
                      phone: isDark
                        ? "text-green-400 bg-green-500/20"
                        : "text-green-600 bg-green-100",
                      instagram: isDark
                        ? "text-pink-400 bg-pink-500/20"
                        : "text-pink-600 bg-pink-100",
                      twitter: isDark
                        ? "text-sky-400 bg-sky-500/20"
                        : "text-sky-600 bg-sky-100",
                      linkedin: isDark
                        ? "text-blue-400 bg-blue-500/20"
                        : "text-blue-600 bg-blue-100",
                      github: isDark
                        ? "text-gray-400 bg-gray-500/20"
                        : "text-gray-600 bg-gray-100",
                      youtube: isDark
                        ? "text-red-400 bg-red-500/20"
                        : "text-red-600 bg-red-100",
                      facebook: isDark
                        ? "text-blue-400 bg-blue-500/20"
                        : "text-blue-600 bg-blue-100",
                      snapchat: isDark
                        ? "text-yellow-400 bg-yellow-500/20"
                        : "text-yellow-600 bg-yellow-100",
                      discord: isDark
                        ? "text-indigo-400 bg-indigo-500/20"
                        : "text-indigo-600 bg-indigo-100",
                      twitch: isDark
                        ? "text-purple-400 bg-purple-500/20"
                        : "text-purple-600 bg-purple-100",
                    };
                    return colors[platform] || colors.email;
                  };

                  const platformColor = getPlatformColor(link.platform);

                  return (
                    <a
                      key={index}
                      href={clickUrl}
                      target={
                        link.platform === "email" || link.platform === "phone"
                          ? "_self"
                          : "_blank"
                      }
                      rel={
                        link.platform === "email" || link.platform === "phone"
                          ? ""
                          : "noopener noreferrer"
                      }
                      className={`group p-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                        isDark
                          ? "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        {/* Platform Icon */}
                        <div
                          className={`p-2 rounded-lg ${
                            platformColor.split(" ")[1]
                          } group-hover:scale-110 transition-transform duration-200`}
                        >
                          <div className={platformColor.split(" ")[0]}>
                            {getSocialIcon(link.platform)}
                          </div>
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
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {link.url.replace(/^(mailto:|tel:)/, "")}
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
    </>
  );
};

export default PublicProfilePage;
