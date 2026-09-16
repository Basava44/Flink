import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { supabase } from "../lib/supabase";
import OnboardingFlow from "../components/OnboardingFlow";
import SocialLinksSection from "../components/SocialLinksSection";
import PublicProfileView from "../components/PublicProfileView";
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  Share2,
  Copy,
  Check,
  MapPin,
  Globe,
  ExternalLink,
  Search,
  Home,
  ArrowRight,
  QrCode,
  X,
  Download,
  HelpCircle,
} from "lucide-react";
import QRCodeImg from "../components/QRCode";

function ProfilePage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { user, userDetails, signOut, getUserDetails, getSocialLinks, getProfileDetails } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      const raw = localStorage.getItem(`flink_social_${user?.id}`);
      if (raw) { const { data } = JSON.parse(raw); return data || []; }
    } catch {}
    return [];
  });
  const [profileDetails, setProfileDetails] = useState(() => {
    try {
      const raw = localStorage.getItem(`flink_profile_${user?.id}`);
      if (raw) { const { data } = JSON.parse(raw); return data || null; }
    } catch {}
    return null;
  });
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const profileName = userDetails?.name || handle;
  useDocumentMeta(
    !profileExists
      ? { title: "Profile not found", description: `@${handle} doesn't exist on Flink`, path: `/${handle}` }
      : {
          title: profileName ? `${profileName} (@${handle})` : `@${handle}`,
          description: profileDetails?.bio || `Check out ${profileName || handle}'s links on Flink`,
          path: `/${handle}`,
          ogImage: profileDetails?.profile_url || undefined,
        }
  );

  const hasLoadedData = useRef(false);
  const isSigningOut = useRef(false);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    try {
      await signOut();
      navigate("/", { replace: true });
    } finally {
      isSigningOut.current = false;
    }
  }, [signOut, navigate]);

  // Redirect on sign out (own profile only)
  useEffect(() => {
    if (user === null && !isCheckingProfile && isOwnProfile) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, isCheckingProfile, isOwnProfile]);

  // Check profile ownership
  useEffect(() => {
    const checkProfile = async () => {
      if (!handle) {
        setProfileExists(false);
        setIsCheckingProfile(false);
        return;
      }
      if (user === undefined) return;

      setIsCheckingProfile(true);
      try {
        const isUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);

        if (isUserId) {
          if (user && user.id === handle) {
            const { data: userProfile } = await supabase
              .from("flink_profiles")
              .select("handle")
              .eq("user_id", user.id)
              .single();

            if (userProfile) {
              navigate(`/${userProfile.handle}`, { replace: true });
              return;
            }
            setIsOwnProfile(true);
            setProfileExists(true);
          } else {
            setProfileExists(false);
          }
        } else {
          const { data: profileData, error: profileError } = await supabase
            .from("flink_profiles")
            .select("user_id")
            .eq("handle", handle.toLowerCase())
            .maybeSingle();

          if (profileError || !profileData) {
            setProfileExists(false);
          } else {
            setIsOwnProfile(user && user.id === profileData.user_id);
            setProfileExists(true);
          }
        }
      } catch {
        setProfileExists(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [handle, user, navigate]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [socialResult, profileResult] = await Promise.all([
        getSocialLinks(user.id),
        getProfileDetails(user.id),
      ]);
      if (!socialResult.error) setSocialLinks(socialResult.data || []);
      if (!profileResult.error) setProfileDetails(profileResult.data);
      await getUserDetails(user.id);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, [user?.id, getSocialLinks, getProfileDetails, getUserDetails]);

  useEffect(() => {
    if (!isOwnProfile || !user?.id) return;

    // Check if settings page flagged a refresh
    let needsRefresh = !hasLoadedData.current;
    try {
      const flag = localStorage.getItem(`forceRefresh_${user.id}`);
      if (flag) {
        needsRefresh = true;
        localStorage.removeItem(`forceRefresh_${user.id}`);
      }
    } catch {}

    if (needsRefresh) {
      loadDashboardData();
      hasLoadedData.current = true;
    }
  }, [isOwnProfile, user?.id, loadDashboardData]);

  const handleOnboardingComplete = async () => {
    // Refresh userDetails so first_login is false (prevents onboarding flash)
    await getUserDetails(user.id);
    hasLoadedData.current = false;
    // Fetch the newly created profile and redirect to handle URL
    const { data: newProfile } = await supabase
      .from("flink_profiles")
      .select("handle")
      .eq("user_id", user.id)
      .single();
    if (newProfile?.handle) {
      navigate(`/${newProfile.handle}`, { replace: true });
    } else {
      await loadDashboardData();
      hasLoadedData.current = true;
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${profileDetails?.handle || handle}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${profileDetails?.handle || handle}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${userDetails?.name} on Flink`, url });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  // Loading
  if (isCheckingProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
        <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-zinc-700 border-t-white" : "border-zinc-200 border-t-zinc-900"}`} />
      </div>
    );
  }

  // 404
  if (!profileExists) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
        {/* Top bar */}
        <div className={`border-b ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
            >
              Flink
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
              isDark ? "bg-zinc-800/80" : "bg-zinc-100"
            }`}>
              <Search className={`w-7 h-7 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
            </div>

            <h1 className={`text-2xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Profile not found
            </h1>
            <p className={`text-sm leading-relaxed mb-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              The handle{" "}
              <span className={`font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>@{handle}</span>{" "}
              doesn't exist yet.
            </p>
            <p className={`text-sm mb-8 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              It might have been changed, or it was never claimed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                  isDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                <Home className="w-4 h-4" />
                Go home
              </button>
              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isDark
                      ? "text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
                      : "text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  Claim this handle
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center">
          <p className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Flink
            </span>
            {" "}- All your socials, one link
          </p>
        </div>
      </div>
    );
  }

  // Public profile (or preview mode for own profile)
  if (!isOwnProfile || isPreview) {
    return <PublicProfileView handle={handle} isPreview={isPreview} />;
  }

  // Own profile - show onboarding full screen if first login
  if (isOwnProfile && userDetails?.first_login) {
    return (
      <OnboardingFlow
        key={`onboarding-${user?.id}`}
        onComplete={handleOnboardingComplete}
        userName={userDetails?.name || user?.email || ""}
        userEmail={userDetails?.email || user?.email || ""}
        userId={user?.id || ""}
      />
    );
  }

  // Own profile dashboard
  const initial = userDetails?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
      {/* Top bar */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b ${
        isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50/80 border-zinc-200"
      }`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Flink
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/help")}
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                isDark ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800" : "text-zinc-400 hover:text-red-500 hover:bg-zinc-100"
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
        {/* Dashboard */}
        {userDetails && (
          <>
            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-8">
              {/* Avatar */}
              <div className="relative mb-4">
                {userDetails?.profile_url ? (
                  <img
                    src={userDetails.profile_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full items-center justify-center text-2xl font-bold ${
                    userDetails?.profile_url ? "hidden" : "flex"
                  } ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-600"}`}
                >
                  {initial}
                </div>
              </div>

              <h1 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                {userDetails?.name || user?.email}
              </h1>

              {profileDetails?.handle && (
                <p className={`text-sm mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  @{profileDetails.handle}
                </p>
              )}

              {profileDetails?.bio && (
                <p className={`mt-2 text-sm leading-relaxed max-w-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {profileDetails.bio}
                </p>
              )}

              {/* Meta pills */}
              {(profileDetails?.location || profileDetails?.website) && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {profileDetails.location && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                      isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <MapPin className="w-3 h-3" />
                      {profileDetails.location}
                    </span>
                  )}
                  {profileDetails.website && (
                    <a
                      href={profileDetails.website.startsWith("http") ? profileDetails.website : `https://${profileDetails.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                        isDark ? "bg-zinc-800/80 text-zinc-400 hover:text-zinc-300" : "bg-zinc-100 text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      {profileDetails.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    copied
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : isDark
                        ? "bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50"
                        : "bg-white text-zinc-500 hover:text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  onClick={handleShare}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    isDark
                      ? "bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50"
                      : "bg-white text-zinc-500 hover:text-zinc-700 border border-zinc-200"
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={() => navigate(`/${profileDetails?.handle || handle}?preview=true`)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    isDark
                      ? "bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50"
                      : "bg-white text-zinc-500 hover:text-zinc-700 border border-zinc-200"
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    isDark
                      ? "bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50"
                      : "bg-white text-zinc-500 hover:text-zinc-700 border border-zinc-200"
                  }`}
                >
                  <QrCode className="w-3 h-3" />
                  QR
                </button>
              </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowQR(false)}
                />
                <div
                  className={`relative w-full max-w-xs rounded-2xl p-6 shadow-2xl ${
                    isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"
                  }`}
                >
                  <button
                    onClick={() => setShowQR(false)}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                      isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                      <QRCodeImg
                        value={`${window.location.origin}/${profileDetails?.handle || handle}`}
                        size={180}
                        className="qr-modal-img"
                      />
                    </div>
                    <p className={`text-sm font-semibold mb-1 ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                      Scan to connect
                    </p>
                    <p className={`text-xs mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                      {window.location.host}/{profileDetails?.handle || handle}
                    </p>
                    <button
                      onClick={() => {
                        const canvas = document.querySelector(".qr-modal-img");
                        if (canvas?.src) {
                          const a = document.createElement("a");
                          a.href = canvas.src;
                          a.download = `flink-${profileDetails?.handle || handle}-qr.png`;
                          a.click();
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                        isDark
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                      }`}
                    >
                      <Download className="w-3 h-3" />
                      Save QR code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            <SocialLinksSection socialLinks={socialLinks} profileDetails={profileDetails} />

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Flink
                </span>
                {" "}- All your socials, one link
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
