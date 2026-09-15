import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ArrowLeft, Sun, Moon, KeyRound } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  useDocumentMeta({ title: "Forgot Password", path: "/forgot-password" });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for password reset instructions!");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
              isDark ? "bg-zinc-800/80" : "bg-zinc-100"
            }`}>
              <KeyRound className={`w-6 h-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Forgot password?
            </h1>
            <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              No worries. We'll send you reset instructions.
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-white text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {isLoading ? "Sending..." : "Send reset instructions"}
            </button>
          </form>

          {/* Toggle */}
          <p className={`mt-8 text-center text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            Remember your password?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`ml-1.5 font-semibold transition-colors ${
                isDark ? "text-white hover:text-zinc-300" : "text-zinc-900 hover:text-zinc-700"
              }`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-0 inset-x-0 py-6 text-center ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
        <p className="text-xs">&copy; {new Date().getFullYear()} Flink. All rights reserved.</p>
      </div>
    </div>
  );
}

export default ForgotPassword;
