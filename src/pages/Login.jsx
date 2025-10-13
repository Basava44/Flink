import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && message && isSignUp) {
      // Only redirect if we were showing the signup success message
      const isSignupSuccess = message.includes("Check your email");
      if (isSignupSuccess) {
        navigate('/');
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, message, isSignUp, navigate]);

  // Note: React Router will handle redirects automatically

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    
    setFormData(newFormData);
    
    // Check password matching in real-time for signup
    if (isSignUp && (name === 'password' || name === 'confirmPassword')) {
      const password = name === 'password' ? value : newFormData.password;
      const confirmPassword = name === 'confirmPassword' ? value : newFormData.confirmPassword;
      
      // Only check if both fields have values
      if (password && confirmPassword) {
        setPasswordsMatch(password === confirmPassword);
      } else {
        setPasswordsMatch(true); // Reset to neutral if either field is empty
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(formData.email, formData.password, { name: formData.name });
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the confirmation link!");
          setCountdown(10); // Start 10-second countdown
          setSignupSuccess(true); // Mark signup as successful
          
          // Log signup data for debugging
          console.log('Signup successful:', data);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
        // Note: Authentication state change will handle redirect to dashboard
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
      // Note: Google OAuth will redirect, so we don't need to handle success here
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openGmail = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();

    // Determine the best email service to open
    let emailUrl = 'https://mail.google.com/mail/u/0/#inbox'; // Default to Gmail
    
    if (emailDomain) {
      if (emailDomain.includes('gmail.com')) {
        emailUrl = 'https://mail.google.com/mail/u/0/#inbox';
      } else if (emailDomain.includes('outlook.com') || emailDomain.includes('hotmail.com')) {
        emailUrl = 'https://outlook.live.com/mail/0/inbox';
      } else if (emailDomain.includes('yahoo.com')) {
        emailUrl = 'https://mail.yahoo.com/';
      } else if (emailDomain.includes('icloud.com')) {
        emailUrl = 'https://www.icloud.com/mail';
      }
    }

    if (isMobile) {
      if (isIOS) {
        // Try to open Gmail app on iOS, fallback to web
        if (emailDomain?.includes('gmail.com')) {
          window.open('googlegmail://co?to=' + encodeURIComponent(formData.email), '_blank');
          // Fallback after a short delay
          setTimeout(() => {
            window.open(emailUrl, '_blank');
          }, 1000);
        } else {
          window.open(emailUrl, '_blank');
        }
      } else if (isAndroid) {
        // Try to open Gmail app on Android, fallback to web
        if (emailDomain?.includes('gmail.com')) {
          window.open('googlegmail://co?to=' + encodeURIComponent(formData.email), '_blank');
          // Fallback after a short delay
          setTimeout(() => {
            window.open(emailUrl, '_blank');
          }, 1000);
        } else {
          window.open(emailUrl, '_blank');
        }
      } else {
        // Other mobile devices - open web email
        window.open(emailUrl, '_blank');
      }
    } else {
      // Desktop/laptop - open email in new tab
      window.open(emailUrl, '_blank');
    }
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
            Login is designed for mobile devices. Please access it from your phone or resize your browser window.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Mobile Login - Visible only on mobile */}
      <div className={`md:hidden min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className={`mb-8 flex items-center transition-colors duration-200 ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Login form */}
        <div className={`rounded-2xl p-8 shadow-soft-lg ${
          isDark 
            ? "bg-slate-800/50 border border-slate-700/50" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 brand-font">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className={`${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              {isSignUp ? "Join Flink and connect your socials" : "Sign in to your Flink account"}
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-200 text-sm">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Check Your Email!</span>
              </div>
              <p className="mb-3">
                We've sent a confirmation link to{" "}
                <span className="font-medium">{formData.email}</span>
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                Click the link in your email to activate your account. Don't forget to check your spam folder!
              </p>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  <strong>Quick Access:</strong> Click below to open your email directly
                </p>
                <button
                  type="button"
                  onClick={() => openGmail()}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.5l-9 6.75L3 7.5V21H1.5C.65 21 0 20.35 0 19.5v-15c0-.85.65-1.5 1.5-1.5H3l9 6.75L21 3h1.5c.85 0 1.5.65 1.5 1.5z"/>
                  </svg>
                  Open Email
                </button>
              </div>
              {countdown > 0 && (
                <div className="flex items-center justify-between bg-green-100 dark:bg-green-800/30 rounded-lg p-2 mt-3">
                  <span className="text-xs">Redirecting to home in:</span>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      {countdown}
                    </div>
                    <span className="text-xs">seconds</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={signupSuccess}
                  className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                      : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={signupSuccess}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={signupSuccess}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={signupSuccess}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-12 ${
                      formData.confirmPassword && formData.password
                        ? passwordsMatch
                          ? isDark
                            ? 'bg-slate-700/50 border border-green-500 text-white placeholder-gray-400 focus:border-green-500'
                            : 'bg-gray-50 border border-green-500 text-gray-900 placeholder-gray-400 focus:border-green-500'
                          : isDark
                          ? 'bg-slate-700/50 border border-red-500 text-white placeholder-gray-400 focus:border-red-500'
                          : 'bg-gray-50 border border-red-500 text-gray-900 placeholder-gray-400 focus:border-red-500'
                        : isDark
                        ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {formData.confirmPassword && formData.password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {passwordsMatch ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmPassword && formData.password && !passwordsMatch && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Passwords don't match
                  </p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className={`w-4 h-4 rounded focus:ring-2 focus:ring-primary-500 ${
                      isDark 
                        ? "text-primary-600 bg-slate-700/50 border-slate-600" 
                        : "text-primary-600 bg-gray-50 border-gray-300"
                    }`}
                  />
                  <span className={`ml-2 text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && signupSuccess) || (isSignUp && formData.password && formData.confirmPassword && !passwordsMatch)}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading
                ? isSignUp ? "Creating Account..." : "Signing In..."
                : isSignUp && signupSuccess ? "Account Created ✓"
                : isSignUp && formData.password && formData.confirmPassword && !passwordsMatch ? "Passwords Don't Match"
                : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className={`mt-6 text-center ${signupSuccess ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setPasswordsMatch(true);
                  setError("");
                }}
                disabled={signupSuccess}
                className="ml-2 text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDark ? "border-gray-600" : "border-gray-300"
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  isDark ? "bg-slate-800 text-gray-400" : "bg-white text-gray-500"
                }`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || signupSuccess}
                className={`w-full max-w-xs inline-flex justify-center py-3 px-4 border rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-slate-600 bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Login;
