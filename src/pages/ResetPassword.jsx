import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ArrowLeft, Sun, Moon, KeyRound, CheckCircle, Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  useDocumentMeta({ title: "Reset Password", path: "/reset-password" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { supabase } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = !confirmPassword || !password || password === confirmPassword;

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
          {/* Back to login */}
          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-1.5 text-sm mb-8 transition-colors duration-200 ${
              isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          {success ? (
            /* Success state */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Password updated
              </h1>
              <p className={`text-sm mb-8 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isDark
                    ? "bg-white text-zinc-900 hover:bg-zinc-200"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                  isDark ? "bg-zinc-800/80" : "bg-zinc-100"
                }`}>
                  <KeyRound className={`w-6 h-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  Set new password
                </h1>
                <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                  Enter your new password below.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-500">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} ${
                      confirmPassword && !passwordsMatch
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !passwordsMatch}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-white text-zinc-900 hover:bg-zinc-200"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {isLoading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-0 inset-x-0 py-6 text-center ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
        <p className="text-xs">&copy; {new Date().getFullYear()} Flink. All rights reserved.</p>
      </div>
    </div>
  );
}

export default ResetPassword;
