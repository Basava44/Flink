import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, ArrowLeft, Sun, Moon } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  useDocumentMeta({ title: "Log in", path: "/login" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill handle from landing page claim
  const claimedHandle = location.state?.claimedHandle;

  // Redirect if already logged in
  useEffect(() => {
    if (!user) return;
    const redirect = async () => {
      const { data: profile } = await supabase
        .from("flink_profiles")
        .select("handle")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.handle) {
        navigate(`/${profile.handle}`, { replace: true });
      } else {
        navigate(`/${user.id}`, { replace: true });
      }
    };
    redirect();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
        });
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) setError(error.message);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await signInWithGoogle();
      if (error) setError(error.message);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    !formData.confirmPassword ||
    !formData.password ||
    formData.password === formData.confirmPassword;

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none ${
    isDark
      ? "bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
      : "bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
  }`;

  return (
    <div className={`min-h-screen relative ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}>
      {/* Subtle gradient wave BG */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-b from-purple-950/30 via-zinc-950/80 to-zinc-950"
            : "bg-gradient-to-b from-purple-100/60 via-pink-50/30 to-white"
        }`} />
      </div>

      {/* Nav */}
      <nav className="relative max-w-5xl mx-auto px-5 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Flink
          </span>
        </button>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-5 pt-12 sm:pt-20 pb-20">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {isSignUp ? "Create your " : "Welcome to "}
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {isSignUp ? "Flink" : "Flink"}
              </span>
            </h1>
            <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {isSignUp
                ? "One link for all your socials"
                : "Sign in to manage your links"}
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-green-500/10 border border-green-500/20 text-green-500">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${
              isDark
                ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? "border-zinc-800" : "border-zinc-200"}`} />
            </div>
            <div className="relative flex justify-center">
              <span className={`px-3 text-xs ${isDark ? "bg-zinc-950 text-zinc-600" : "bg-white text-zinc-400"}`}>
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Full name"
                required
              />
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Email address"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${inputClass} pr-10`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isSignUp && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${inputClass} ${
                    formData.confirmPassword && !passwordsMatch
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Confirm password"
                  required
                />
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-red-500">Passwords don't match</p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className={`text-xs font-medium ${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && !passwordsMatch)}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-white text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {loading
                ? isSignUp ? "Creating account..." : "Signing in..."
                : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          {/* Consent note */}
          {isSignUp && (
            <p className={`mt-4 text-center text-xs leading-relaxed ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              By creating an account, you agree to our{" "}
              <button onClick={() => navigate("/terms")} className={`underline ${isDark ? "hover:text-zinc-400" : "hover:text-zinc-600"}`}>
                Terms of Service
              </button>{" "}
              and{" "}
              <button onClick={() => navigate("/privacy")} className={`underline ${isDark ? "hover:text-zinc-400" : "hover:text-zinc-600"}`}>
                Privacy Policy
              </button>.
            </p>
          )}

          {/* Toggle */}
          <p className={`mt-8 text-center text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setMessage("");
              }}
              className={`ml-1.5 font-semibold transition-colors ${
                isDark ? "text-white hover:text-zinc-300" : "text-zinc-900 hover:text-zinc-700"
              }`}
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-0 inset-x-0 py-6 flex items-center justify-center gap-4 ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
        <button
          onClick={() => navigate("/privacy")}
          className={`text-xs transition-colors ${isDark ? "hover:text-zinc-500" : "hover:text-zinc-600"}`}
        >
          Privacy
        </button>
        <button
          onClick={() => navigate("/terms")}
          className={`text-xs transition-colors ${isDark ? "hover:text-zinc-500" : "hover:text-zinc-600"}`}
        >
          Terms
        </button>
        <p className="text-xs">&copy; {new Date().getFullYear()} Flink</p>
      </div>
    </div>
  );
}

export default Login;
