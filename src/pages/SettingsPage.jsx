import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import BackgroundPattern from "../components/BackgroundPattern";
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
  FileText,
  Camera,
  Upload,
  User,
  Lock,
  Send,
  BookOpen,
  Music,
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, supabase, getSocialLinks, getProfileDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [originalProfileUrl, setOriginalProfileUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [userProfileHandle, setUserProfileHandle] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Convert social links array to object format for editing
  const [socialLinksData, setSocialLinksData] = useState({});
  const [duplicatePlatforms, setDuplicatePlatforms] = useState({});
  // Profile details for editing
  const [profileData, setProfileData] = useState({
    bio: "",
    location: "",
    website: "",
    private: false,
  });

  const socialPlatforms = [
    {
      key: "email",
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      placeholder: "your@email.com",
      type: "email",
    },
    {
      key: "phone",
      name: "Phone",
      icon: <Phone className="w-5 h-5" />,
      placeholder: "phone number",
      type: "tel",
    },
    {
      key: "whatsapp",
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      placeholder: "phone number or wa.me/username",
    },
    {
      key: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      placeholder: "@username",
    },
    {
      key: "twitter",
      name: "Twitter/X",
      icon: <Twitter className="w-5 h-5" />,
      placeholder: "@username",
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      placeholder: "linkedin.com/in/username",
    },
    {
      key: "github",
      name: "GitHub",
      icon: <Github className="w-5 h-5" />,
      placeholder: "github.com/username",
    },
    {
      key: "youtube",
      name: "YouTube",
      icon: <Youtube className="w-5 h-5" />,
      placeholder: "youtube.com/@username",
    },
    {
      key: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      placeholder: "facebook.com/username",
    },
    {
      key: "snapchat",
      name: "Snapchat",
      icon: <MessageCircle className="w-5 h-5" />,
      placeholder: "@username",
    },
    {
      key: "discord",
      name: "Discord",
      icon: <MessageCircle className="w-5 h-5" />,
      placeholder: "username#1234",
    },
    {
      key: "twitch",
      name: "Twitch",
      icon: <Gamepad2 className="w-5 h-5" />,
      placeholder: "twitch.tv/username",
    },
    {
      key: "telegram",
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      placeholder: "@username",
    },
    {
      key: "reddit",
      name: "Reddit",
      icon: <MessageCircle className="w-5 h-5" />,
      placeholder: "u/username",
    },
    {
      key: "spotify",
      name: "Spotify",
      icon: <Music className="w-5 h-5" />,
      placeholder: "open.spotify.com/user/username",
    },
    {
      key: "medium",
      name: "Medium",
      icon: <BookOpen className="w-5 h-5" />,
      placeholder: "medium.com/@username",
    },
    {
      key: "threads",
      name: "Threads",
      icon: <Twitter className="w-5 h-5" />,
      placeholder: "@username",
    },
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

          // Load profile details from flink_profiles table
          const { data: profileData } = await getProfileDetails(user.id);
          setProfileDetails(profileData);

          // Get user's profile handle for navigation
          if (profileData?.handle) {
            setUserProfileHandle(profileData.handle);
          }

          // Load user details from users table to get name
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
          }

          // Initialize form data
          if (socialData) {
            const linksObject = {};
            socialData.forEach((link) => {
              linksObject[link.platform] = link.url;
            });
            setSocialLinksData(linksObject);
          }

          if (profileData) {
            setProfileData({
              bio: profileData.bio || "",
              location: profileData.location || "",
              website: profileData.website || "",
              private: profileData.private || false,
            });
          }

          // Set profile picture URL from flink_profiles table
          const userProfileUrl = profileData?.profile_url || "";
          setProfileUrl(userProfileUrl);
          setOriginalProfileUrl(userProfileUrl);
          setPreviewUrl(userProfileUrl);

          const userDisplayName = userData?.name || "";
          setDisplayName(userDisplayName);
          setOriginalDisplayName(userDisplayName);
        } catch (err) {
          console.error("Error loading user data:", err);
          setError("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user?.id, getSocialLinks, getProfileDetails, supabase]);

  // Scroll detection and idle state management
  useEffect(() => {
    const idleTimeout = idleTimeoutRef.current;

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        // Action bar logic removed - now shows immediately when hasChanges is true
      }, 150); // 150ms after scroll stops
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [hasChanges]);

  // Check for changes
  useEffect(() => {
    const checkForChanges = () => {
      // Check if social links have changed
      const currentSocialLinks = {};
      const duplicatePlatforms = {};

      socialLinks.forEach((link) => {
        if (currentSocialLinks[link.platform]) {
          // Track duplicates
          if (!duplicatePlatforms[link.platform]) {
            duplicatePlatforms[link.platform] = [
              currentSocialLinks[link.platform],
            ];
          }
          duplicatePlatforms[link.platform].push(link.url);
        } else {
          currentSocialLinks[link.platform] = link.url;
        }
      });

      // Store duplicates in state for UI display
      setDuplicatePlatforms(duplicatePlatforms);

      // Log duplicates for debugging
      if (Object.keys(duplicatePlatforms).length > 0) {
        console.warn("Duplicate social links found:", duplicatePlatforms);
      }

      const socialLinksChanged =
        JSON.stringify(currentSocialLinks) !== JSON.stringify(socialLinksData);

      // Check if profile data has changed
      const currentProfileData = {
        bio: profileDetails?.bio || "",
        location: profileDetails?.location || "",
        website: profileDetails?.website || "",
        private: profileDetails?.private || false,
      };

      const profileChanged =
        JSON.stringify(currentProfileData) !== JSON.stringify(profileData);

      // Check if profile URL has changed
      const profileUrlChanged = profileUrl !== originalProfileUrl;
      // Check if display name changed
      const displayNameChanged = displayName !== originalDisplayName;

      const hasChanges =
        socialLinksChanged ||
        profileChanged ||
        profileUrlChanged ||
        displayNameChanged;
      setHasChanges(hasChanges);
    };

    checkForChanges();
  }, [
    socialLinksData,
    profileData,
    socialLinks,
    profileDetails,
    profileUrl,
    originalProfileUrl,
    displayName,
    originalDisplayName,
  ]);

  const handleInputChange = (platform, value) => {
    setSocialLinksData((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image compression function
  const compressImage = (
    file,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Image upload functions
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Clear any previous errors
      setError("");

      try {
        // Compress the image before uploading
        setUploading(true);
        const compressedBlob = await compressImage(file);

        // Create preview URL from compressed image
        const preview = URL.createObjectURL(compressedBlob);
        setPreviewUrl(preview);

        // Upload compressed image
        uploadImage(compressedBlob, file.name);
      } catch (err) {
        console.error("Error compressing image:", err);
        setError("Failed to process image. Please try again.");
        setUploading(false);
      }
    }
  };

  const uploadImage = async (blob, originalFileName) => {
    try {
      // Generate unique filename
      const fileExt = originalFileName.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // Upload compressed blob to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: blob.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL with transformation for faster loading
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_photos").getPublicUrl(fileName);

      // Update profile URL state
      setProfileUrl(publicUrl);
      setHasChanges(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
      // Reset preview if upload fails
      setPreviewUrl(profileDetails?.profile_url || "");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    setProfileUrl("");
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Track which data changed
      let socialLinksChanged = false;
      let profileDetailsChanged = false;
      let profileUrlChanged = false;
      let displayNameChanged = false;

      // Check if social links changed (URLs only)
      const currentSocialLinks = {};
      socialLinks.forEach((link) => {
        currentSocialLinks[link.platform] = link.url;
      });
      socialLinksChanged =
        JSON.stringify(currentSocialLinks) !== JSON.stringify(socialLinksData);

      // Check if profile details changed
      const currentProfileData = {
        bio: profileDetails?.bio || "",
        location: profileDetails?.location || "",
        website: profileDetails?.website || "",
        private: profileDetails?.private || false,
      };
      profileDetailsChanged =
        JSON.stringify(currentProfileData) !== JSON.stringify(profileData);

      // Check if profile URL changed
      profileUrlChanged = profileUrl !== originalProfileUrl;
      displayNameChanged = displayName !== originalDisplayName;

      // Only update social links if they changed (URLs or privacy)
      if (socialLinksChanged) {
        // First, clean up any duplicate social links
        if (Object.keys(duplicatePlatforms).length > 0) {
          // console.log("Cleaning up duplicate social links...");
          for (const platform of Object.keys(duplicatePlatforms)) {
            const { error: deleteError } = await supabase
              .from("social_links")
              .delete()
              .eq("user_id", user.id)
              .eq("platform", platform);

            if (deleteError) {
              console.error(
                `Error deleting duplicate ${platform} links:`,
                deleteError
              );
            }
          }
        }

        // Prepare all social links to insert (only non-empty ones)
        const linksToInsert = [];

        socialPlatforms.forEach((platform) => {
          const newValue = socialLinksData[platform.key]?.trim() || "";

          if (newValue) {
            // Use global profile privacy setting for all social links
            linksToInsert.push({
              user_id: user.id,
              platform: platform.key,
              url: newValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        });

        // Delete all existing social links for this user first
        const { error: deleteError } = await supabase
          .from("social_links")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }

        // Insert new social links
        if (linksToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("social_links")
            .insert(linksToInsert);

          if (insertError) {
            throw insertError;
          }
        }

        // Clear dashboard cache to force refresh
        localStorage.removeItem(`socialLinks_${user.id}`);
        localStorage.removeItem(`cacheTimestamp_${user.id}`);
        localStorage.setItem(`cacheCleared_${user.id}`, "true");
      }

      // Only update profile details if they changed
      if (profileDetailsChanged) {
        const { error: profileError } = await supabase
          .from("flink_profiles")
          .update({
            bio: profileData.bio.trim() || null,
            location: profileData.location.trim() || null,
            website: profileData.website.trim() || null,
            private: profileData.private || false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (profileError) {
          throw profileError;
        }
      }

      // Only update profile_url if it changed
      if (profileUrlChanged) {
        // Update both tables to maintain consistency
        const [profileResult, userResult] = await Promise.all([
          supabase
            .from("flink_profiles")
            .update({
              profile_url: profileUrl || null,
            })
            .eq("user_id", user.id),
          supabase
            .from("users")
            .update({
              profile_url: profileUrl || null,
            })
            .eq("id", user.id),
        ]);

        if (profileResult.error) {
          console.error(
            "Error updating profile_url in flink_profiles table:",
            profileResult.error
          );
          throw profileResult.error;
        }

        if (userResult.error) {
          console.error(
            "Error updating profile_url in users table:",
            userResult.error
          );
          throw userResult.error;
        }

        setOriginalProfileUrl(profileUrl);
      }

      // Only update display name if it changed
      if (displayNameChanged) {
        const { error: nameUpdateError } = await supabase
          .from("users")
          .update({
            name: displayName.trim() || null,
          })
          .eq("id", user.id);

        if (nameUpdateError) {
          console.error("Error updating name in users table:", nameUpdateError);
          throw nameUpdateError;
        }

        setOriginalDisplayName(displayName);
      }

      // If nothing changed, just show success and return
      if (
        !socialLinksChanged &&
        !profileDetailsChanged &&
        !profileUrlChanged &&
        !displayNameChanged
      ) {
        setShowSnackbar(true);
        setHasChanges(false);

        setTimeout(() => {
          setShowSnackbar(false);
        }, 3000);

        setTimeout(() => {
          navigate(userProfileHandle ? `/${userProfileHandle}` : `/${user.id}`);
        }, 600);

        setLoading(false);
        return;
      }

      setShowSnackbar(true);
      setHasChanges(false);
      // Signal dashboard to force-refresh upon return
      try {
        localStorage.setItem(`forceRefresh_${user.id}`, Date.now().toString());
      } catch {
        // console.warn("Unable to set forceRefresh flag");
      }

      // Only refresh the data that was changed
      if (socialLinksChanged) {
        const { data: socialData } = await getSocialLinks(user.id);
        setSocialLinks(socialData || []);
        localStorage.setItem(
          `socialLinks_${user.id}`,
          JSON.stringify(socialData || [])
        );
      }

      if (profileDetailsChanged) {
        const { data: updatedProfileData } = await getProfileDetails(user.id);
        setProfileDetails(updatedProfileData);
        // Refresh display name if changed
        if (displayNameChanged) {
          const { data: refreshedUser } = await supabase
            .from("users")
            .select("name")
            .eq("id", user.id)
            .single();
          setDisplayName(refreshedUser?.name || "");
          setOriginalDisplayName(refreshedUser?.name || "");
        }

        // Update cache with profile details
        const cacheData = {
          ...updatedProfileData,
          profile_url: profileUrl,
        };
        localStorage.setItem(
          `profileDetails_${user.id}`,
          JSON.stringify(cacheData)
        );
      }

      // Update cache timestamp
      localStorage.setItem(`cacheTimestamp_${user.id}`, Date.now().toString());

      // Auto-hide snackbar after 3 seconds
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      // Signal dashboard to force-refresh upon return
      try {
        localStorage.setItem(`forceRefresh_${user.id}`, Date.now().toString());
      } catch {
        // console.warn("Unable to set forceRefresh flag");
      }

      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate(userProfileHandle ? `/${userProfileHandle}` : `/${user.id}`);
      }, 600);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Add slide-out animation
    const settingsPage = document.querySelector(".settings-page");
    if (settingsPage) {
      settingsPage.style.transform = "translateX(100%)";
      settingsPage.style.transition = "transform 0.3s ease-in-out";
    }

    // Navigate after animation
    setTimeout(() => {
      navigate(userProfileHandle ? `/${userProfileHandle}` : `/${user.id}`);
    }, 300);
  };

  if (loading && !socialLinks.length && !profileDetails) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`settings-page min-h-screen relative slide-in-from-right ${
        isDark ? "text-white" : "text-gray-900"
      }`}
    >
      <BackgroundPattern />
      {/* Success Snackbar */}
      {showSnackbar && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`mx-auto max-w-sm rounded-lg shadow-lg border ${
              isDark
                ? "bg-green-900/90 border-green-700 text-green-100"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
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
              <Settings
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <h1
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`container mx-auto px-4 py-6 ${
          hasChanges ? "pb-32" : "pb-24"
        }`}
      >
        {/* Info Message */}
        <div
          className={`mb-6 p-3 rounded-lg ${
            isDark
              ? "bg-slate-800/30 border border-slate-700 text-slate-300"
              : "bg-gray-100 border border-gray-200 text-gray-600"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium">Note:</span> Flink handle and email
              are permanent and cannot be changed. You can edit your bio,
              location, website, and social links below.
            </p>
          </div>
        </div>

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div
            className={`p-4 rounded-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-base font-semibold mb-3 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Profile Picture
            </h2>

            <div className="flex flex-col items-center space-y-3">
              {/* Image Preview */}
              <div className="relative">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 shadow-md"
                      onLoad={(e) => {
                        e.target.style.opacity = "1";
                      }}
                      style={{
                        opacity: 0,
                        transition: "opacity 0.1s ease-in-out",
                      }}
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200 shadow"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                      isDark
                        ? "border-slate-600 bg-slate-700"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <Camera
                      className={`w-8 h-8 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="w-full max-w-md">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center space-x-2 ${
                    uploading
                      ? isDark
                        ? "border-gray-600 bg-gray-700/40 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-gray-100/80 text-gray-400 cursor-not-allowed"
                      : isDark
                      ? "border-slate-600 bg-slate-700/50 text-gray-300 hover:border-primary-500 hover:bg-slate-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:border-primary-500 hover:bg-gray-100"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent"></div>
                      <span>Uploading...</span>
                    </>
                  ) : previewUrl ? (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Change Photo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Profile Photo</span>
                    </>
                  )}
                </button>

                <p
                  className={`mt-1.5 text-xs text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  JPG, PNG, or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Display Name Section */}
          <div
            className={`p-4 rounded-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-base font-semibold mb-3 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Display Name
            </h2>
            <div className="relative max-w-xl">
              <label
                htmlFor="displayName"
                className={`flex items-center text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <span className="mr-2">
                  <User className="w-4 h-4" />
                </span>
                Display Name
              </label>
              <div className="relative">
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onFocus={() => setFocusedField("displayName")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl focus:outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                      : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                  }`}
                  placeholder="Your name as shown on your profile"
                />
                {displayName && focusedField === "displayName" && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDisplayName("");
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                      isDark
                        ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                        : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                    title="Clear field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div
            className={`p-6 rounded-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Social Media Links
            </h2>

            {/* Duplicate warning */}
            {Object.keys(duplicatePlatforms).length > 0 && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  isDark
                    ? "bg-yellow-900/20 border border-yellow-700 text-yellow-300"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">
                    <span className="font-medium">Warning:</span> Multiple
                    entries found for:{" "}
                    {Object.keys(duplicatePlatforms).join(", ")}. Only the first
                    entry is shown. Please save your changes to clean up
                    duplicates.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={platform.key}
                      className={`flex items-center text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{platform.icon}</span>
                      {platform.name}
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={platform.type || "text"}
                      id={platform.key}
                      value={socialLinksData[platform.key] || ""}
                      onChange={(e) =>
                        handleInputChange(platform.key, e.target.value)
                      }
                      onFocus={() => setFocusedField(platform.key)}
                      onBlur={() => setFocusedField(null)}
                      disabled={platform.key === "email"}
                      className={`w-full px-4 py-3 pr-10 rounded-xl focus:outline-none transition-all duration-200 ${
                        platform.key === "email"
                          ? isDark
                            ? "bg-slate-600/30 border border-slate-500 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                          : isDark
                          ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                          : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                      }`}
                      placeholder={platform.placeholder}
                    />
                    {platform.key === "email" && (
                      <p className={`mt-1 text-xs pl-2 text-green-600`}>
                        Email cannot be edited.
                      </p>
                    )}
                    {socialLinksData[platform.key] &&
                      focusedField === platform.key &&
                      platform.key !== "email" && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleInputChange(platform.key, "");
                          }}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                            isDark
                              ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                              : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                          }`}
                          title="Clear field"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Details Section */}
          <div
            className={`p-6 rounded-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Profile Details
            </h2>

            <div className="space-y-4">
              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className={`flex items-center text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <span className="mr-2">
                    <FileText className="w-4 h-4" />
                  </span>
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
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
                  <label
                    htmlFor="location"
                    className={`flex items-center text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <span className="mr-2">
                      <MapPin className="w-4 h-4" />
                    </span>
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        handleProfileChange("location", e.target.value)
                      }
                      onFocus={() => setFocusedField("location")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pr-10 rounded-xl focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                          : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                      }`}
                      placeholder="City, Country"
                    />
                    {profileData.location && focusedField === "location" && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleProfileChange("location", "");
                        }}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                          isDark
                            ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                            : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                        title="Clear field"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label
                    htmlFor="website"
                    className={`flex items-center text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <span className="mr-2">
                      <Globe className="w-4 h-4" />
                    </span>
                    Website
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="website"
                      value={profileData.website}
                      onChange={(e) =>
                        handleProfileChange("website", e.target.value)
                      }
                      onFocus={() => setFocusedField("website")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pr-10 rounded-xl focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                          : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                    {profileData.website && focusedField === "website" && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleProfileChange("website", "");
                        }}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                          isDark
                            ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                            : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                        title="Clear field"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Privacy Section */}
          <div
            className={`p-6 rounded-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Profile Visibility
            </h2>

            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-slate-700/50 border border-slate-600"
                  : "bg-gray-50 border border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {profileData.private
                        ? "Private Profile"
                        : "Public Profile"}
                    </h3>
                    {profileData.private ? (
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          isDark
                            ? "bg-orange-900/30 text-orange-400 border border-orange-800"
                            : "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}
                      >
                        <Lock className="w-3 h-3 inline mr-1" />
                        Private
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          isDark
                            ? "bg-green-900/30 text-green-400 border border-green-800"
                            : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        <Globe className="w-3 h-3 inline mr-1" />
                        Public
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {profileData.private
                      ? "Only you can see your profile details and social links"
                      : "Anyone can view your profile and social links"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleProfileChange("private", !profileData.private)
                  }
                  aria-label={`Toggle profile visibility to ${
                    profileData.private ? "public" : "private"
                  }`}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    profileData.private
                      ? isDark
                        ? "bg-orange-600"
                        : "bg-orange-500"
                      : isDark
                      ? "bg-green-600"
                      : "bg-green-500"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      profileData.private ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-red-900/20 border border-red-800 text-red-300"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Smart Floating Action Bar */}
      {hasChanges && (
        <div
          className={`fixed bottom-6 left-4 right-4 z-20 transform transition-all duration-300 ease-out translate-y-0 opacity-100`}
        >
          <div
            className={`backdrop-blur-lg rounded-2xl shadow-2xl border ${
              isDark
                ? "bg-slate-800/90 border-slate-600/50"
                : "bg-white/90 border-gray-200/50"
            }`}
          >
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
                    "Save Changes"
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
