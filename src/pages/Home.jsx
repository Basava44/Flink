import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "../lib/supabase";
import {
  Link2,
  Zap,
  Users,
  ArrowRight,
  Check,
  X,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [handleInput, setHandleInput] = useState("");
  const [handleStatus, setHandleStatus] = useState(null);
  const checkTimeout = useRef(null);

  useEffect(() => {
    const redirectToProfile = async () => {
      if (user?.id && !loading) {
        try {
          const { data: profileData } = await supabase
            .from("flink_profiles")
            .select("handle")
            .eq("user_id", user.id)
            .single();
          navigate(profileData?.handle ? `/${profileData.handle}` : `/${user.id}`, { replace: true });
        } catch {
          navigate(`/${user.id}`, { replace: true });
        }
      }
    };
    redirectToProfile();
  }, [user?.id, loading, navigate]);

  const checkHandle = (value) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setHandleInput(clean);
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    if (clean.length < 3) { setHandleStatus(null); return; }
    setHandleStatus("checking");
    checkTimeout.current = setTimeout(async () => {
      try {
        const { data } = await supabase.from("flink_profiles").select("id").eq("handle", clean).maybeSingle();
        setHandleStatus(data ? "taken" : "available");
      } catch { setHandleStatus(null); }
    }, 400);
  };

  const handleClaim = () => {
    navigate("/login", { state: { claimedHandle: handleInput } });
  };

  if (loading || user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-zinc-950" : "bg-white"}`}>
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-zinc-700 border-t-zinc-400" : "border-zinc-200 border-t-zinc-600"}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}>
      {/* Nav */}
      <nav className="relative max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between">
        <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Flink
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate("/login")}
            className={`text-sm font-medium px-3 sm:px-4 py-2 rounded-lg border transition-colors ${
              isDark ? "text-zinc-400 hover:text-white border-zinc-700" : "text-zinc-600 hover:text-zinc-900 border-zinc-200"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/login")}
            className={`text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
              isDark
                ? "bg-white text-zinc-900 hover:bg-zinc-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Subtle gradient wave BG */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-b from-purple-950/20 via-transparent to-transparent"
            : "bg-gradient-to-b from-purple-100/30 via-pink-50/10 to-transparent"
        }`} />
      </div>

      {/* Hero */}
      <section className="relative max-w-3xl mx-auto px-4 sm:px-5 pt-20 sm:pt-32 pb-16 sm:pb-20 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-5 sm:mb-6">
          All your socials.
          <br />
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            One link.
          </span>
        </h1>

        <p className={`text-base sm:text-xl max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed ${
          isDark ? "text-zinc-500" : "text-zinc-500"
        }`}>
          Stop sharing 10 different usernames. Create your Flink - a single link
          to all your social profiles, contact info, and more.
        </p>

        {/* Handle claim input */}
        <div className="max-w-md mx-auto">
          <div className={`flex items-center rounded-xl p-1.5 ${
            isDark
              ? "bg-zinc-900 border border-zinc-800"
              : "bg-zinc-50 border border-zinc-200"
          }`}>
            <span className={`pl-3 sm:pl-4 pr-0.5 text-xs sm:text-sm font-mono flex-shrink-0 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              flink.to/
            </span>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => checkHandle(e.target.value)}
              placeholder="yourname"
              className={`flex-1 min-w-0 px-1 py-3 text-sm bg-transparent outline-none ${
                isDark ? "text-white placeholder-zinc-700" : "text-zinc-900 placeholder-zinc-400"
              }`}
            />
            <button
              onClick={handleInput.length >= 3 && handleStatus === "available" ? handleClaim : () => navigate("/login")}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 flex-shrink-0 ${
                isDark
                  ? "bg-white text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              Claim
            </button>
          </div>
          <div className="h-6 mt-2">
            {handleStatus === "checking" && (
              <p className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Checking...</p>
            )}
            {handleStatus === "available" && (
              <p className="text-xs text-green-500 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                flink.to/{handleInput} is available
              </p>
            )}
            {handleStatus === "taken" && (
              <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                <X className="w-3 h-3" />
                flink.to/{handleInput} is taken
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Platform icons */}
      <section className="pb-20 sm:pb-24 px-4 sm:px-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className={`text-xs font-medium uppercase tracking-widest mb-4 sm:mb-5 ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
            Works with everything
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {[
              { icon: Instagram, color: "from-pink-500 to-rose-500" },
              { icon: Twitter, color: "from-sky-400 to-blue-500" },
              { icon: Github, color: "from-gray-600 to-gray-800" },
              { icon: Linkedin, color: "from-blue-600 to-blue-700" },
              { icon: Youtube, color: "from-red-500 to-red-600" },
              { icon: Mail, color: "from-blue-500 to-blue-600" },
              { icon: Phone, color: "from-green-500 to-green-600" },
              { icon: MessageCircle, color: "from-emerald-500 to-emerald-600" },
            ].map(({ icon: Icon, color }, i) => (
              <div
                key={i}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
              </div>
            ))}
            <span className={`text-xs font-medium ml-1 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              +10 more
            </span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className={`max-w-5xl mx-auto border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`} />

      {/* Features */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Why{" "}
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Flink
              </span>
              ?
            </h2>
            <p className={`text-base max-w-lg mx-auto ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              Everything you need to share your online identity
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Link2,
                title: "One link for everything",
                desc: "Instagram, WhatsApp, Twitter, LinkedIn, email, phone - all from a single URL.",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: Zap,
                title: "Save as contact",
                desc: "Visitors can download your info directly to their phone with one tap.",
                gradient: "from-purple-500 to-indigo-500",
              },
              {
                icon: Users,
                title: "Share anywhere",
                desc: "Bio, resume, email signature, business card, or QR code. It just works.",
                gradient: "from-blue-500 to-cyan-500",
              },
            ].map(({ icon: Icon, title, desc, gradient }, i) => (
              <div
                key={i}
                className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isDark
                    ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                    : "bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-zinc-200/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`py-24 px-5 ${isDark ? "bg-zinc-900/50" : "bg-zinc-50"}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready in 60 seconds
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Sign up", desc: "Free account with email or Google", gradient: "from-pink-500 to-rose-500" },
              { step: "2", title: "Add your links", desc: "Connect all your social profiles", gradient: "from-purple-500 to-indigo-500" },
              { step: "3", title: "Share your Flink", desc: "One link everywhere you go", gradient: "from-blue-500 to-cyan-500" },
            ].map(({ step, title, desc, gradient }, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                  {step}
                </div>
                <h3 className="text-base font-semibold mb-1">{title}</h3>
                <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-5">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Your link, your{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              identity
            </span>
          </h2>
          <p className={`text-base mb-8 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Join Flink and make connecting effortless.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
          >
            Create your Flink
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 px-5 border-t ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Flink</span>
            <span className={`text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              - All your socials, one link
            </span>
          </div>
          <p className={`text-xs ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
            &copy; {new Date().getFullYear()} Flink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
