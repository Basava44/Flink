// Home page component - move App.jsx content here
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle";
import SearchOverlay from "../components/SearchOverlay";
import { Search } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [handleInput, setHandleInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Redirect logged-in users to their profile
  useEffect(() => {
    const redirectToProfile = async () => {
      if (user?.id && !loading) {
        try {
          const { data: profileData } = await supabase
            .from("flink_profiles")
            .select("handle")
            .eq("user_id", user.id)
            .single();

          if (profileData?.handle) {
            navigate(`/${profileData.handle}`, { replace: true });
          } else {
            navigate(`/${user.id}`, { replace: true });
          }
        } catch (err) {
          console.error("Error checking user profile:", err);
          navigate(`/${user.id}`, { replace: true });
        }
      }
    };

    redirectToProfile();
  }, [user?.id, loading, navigate]);

  const handleGetStarted = () => {
    if (user) {
      // console.log("User is logged in, going to profile");
      // The useEffect will handle the redirect
    } else {
      navigate("/login");
    }
  };

  const checkAvailability = (handle) => {
    setHandleInput(handle);
    // This is to check in future for logins
    // if (handle.length > 2) {
    //   setIsChecking(true);
    //   setTimeout(() => {
    //     setIsChecking(false);
    //   }, 800);
    // }
  };

  const openSearchOverlay = () => {
    setShowSearch(true);
  };

  const closeSearchOverlay = () => {
    setShowSearch(false);
  };

  // Note: Auth state changes are now handled by AppContent component

  return (
    <div
      className={`home-page min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ThemeToggle />

      {/* Hero Section */}
      <section className="min-h-[75vh] flex items-center justify-center px-4 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 fade-in">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isDark
                  ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                  : "bg-primary-100 text-primary-700 border border-primary-200"
              }`}
            >
              ✨ The Future of Social Connection
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight fade-in">
            <span className="brand-font text-6xl sm:text-7xl md:text-8xl block mb-4">
              Flink
            </span>
            <span
              className={`text-2xl sm:text-3xl md:text-4xl font-normal ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              All your socials. One link.
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-600"
            } fade-in`}
          >
            Why share multiple usernames when you can share one link? Connect
            with anyone, instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in">
            <button
              onClick={handleGetStarted}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </button>
          </div>
        </div>
      </section>

      {/* Handle Checker */}
      <section className="pb-10 px-4">
        <div className="max-w-md mx-auto">
          <div
            className={`rounded-2xl p-6 sm:p-8 shadow-soft ${
              isDark
                ? "bg-slate-800/50 border border-slate-700/50"
                : "bg-white border border-gray-200"
            }`}
          >
            <label
              className={`block text-sm font-semibold mb-3 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Check your Flink handle
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <span
                className={`font-mono text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                flink.app/
              </span>
              <input
                type="text"
                placeholder="yourname"
                className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl focus:outline-none transition-all duration-200 text-sm ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                value={handleInput}
                onChange={(e) => checkAvailability(e.target.value)}
              />
            </div>
            {handleInput.length > 2 && (
              <p className="text-sm text-green-600 flex items-center space-x-2 fade-in">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>flink.app/{handleInput} is available!</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Search Profiles Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Discover Amazing Profiles
          </h2>
          <p
            className={`text-lg mb-8 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Find and connect with people from around the world
          </p>

          {/* Search Button */}
          <button
            onClick={openSearchOverlay}
            className={`inline-flex items-center px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-105 ${
              isDark
                ? "bg-slate-800/50 border border-slate-600 text-white hover:bg-slate-700"
                : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Search className="w-5 h-5 mr-3" />
            Search Profiles
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-20 px-4 ${
          isDark ? "bg-slate-800/30" : "bg-gray-100/50"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="brand-font">What's Flink?</span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your digital social hub — all your online identity in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`p-8 rounded-2xl transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30"
                  : "bg-white border border-gray-200 hover:border-primary-300"
              }`}
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                All Platforms
              </h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Instagram, WhatsApp, Twitter, Snapchat, YouTube… all in one
                place.
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700/50 hover:border-accent-500/30"
                  : "bg-white border border-gray-200 hover:border-accent-300"
              }`}
            >
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent-600 dark:text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                One Link
              </h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                One Flink link or QR code to share anywhere.
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30"
                  : "bg-white border border-gray-200 hover:border-primary-300"
              }`}
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Instant Connect
              </h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Connect with anyone, fast and hassle-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-20 px-4 ${isDark ? "bg-slate-800/50" : "bg-gray-100"}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p
            className={`text-xl mb-8 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Join thousands of users who've simplified their social connections.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
          >
            {user ? "Manage Your Flink" : "Create Your Flink"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 px-4 text-center border-t ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h3 className="text-2xl font-bold brand-font mb-2">Flink</h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Connect better, share easier.
            </p>
          </div>
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            © 2025 Flink. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Search Overlay */}
      <SearchOverlay isOpen={showSearch} onClose={closeSearchOverlay} />
    </div>
  );
}

export default Home;
