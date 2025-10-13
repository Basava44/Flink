import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function ForgotPassword() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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

  const onBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Password reset is designed for mobile devices. Please access it from your phone or resize your browser window.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Login
          </button>
        </div>
      </div>

      {/* Mobile Forgot Password - Visible only on mobile */}
      <div className={`md:hidden min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        {/* Background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 float-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 float-animation"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="max-w-md w-full relative z-10">
        {/* Back button */}
        <button
          onClick={onBackToLogin}
          className={`mb-8 flex items-center transition-colors duration-200 ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Login
        </button>

        {/* Forgot Password form */}
        <div className={`rounded-3xl py-8 px-12  border transition-all duration-300 ${
          isDark 
            ? "bg-slate-800/50 backdrop-blur-md border-slate-700/50" 
            : "bg-white border-gray-200 shadow-lg"
        }`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Forgot Password?
            </h1>
            <p className={`text-sm sm:text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${
              isDark 
                ? "bg-green-500/20 border border-green-500/30 text-green-300" 
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              {message}
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${
              isDark 
                ? "bg-red-500/20 border border-red-500/30 text-red-300" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105 disabled:hover:scale-100 text-sm sm:text-base"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default ForgotPassword;