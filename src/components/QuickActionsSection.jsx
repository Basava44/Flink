import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Link, Share2, X, Copy, QrCode, Check, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCodeImg from './QRCode';

const QuickActionsSection = ({ profileDetails }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { userDetails } = useAuth();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://flink.to/${profileDetails?.handle || 'your-handle'}`;

  const handleSocialLinksClick = () => {
    navigate('/settings');
  };

  const handleShareClick = () => {
    setShowShareSheet(true);
    requestAnimationFrame(() => setIsAnimating(true));
  };

  const handleCloseSheet = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowShareSheet(false);
      setCopied(false);
    }, 300);
  }, []);

  // Close on escape key
  useEffect(() => {
    if (!showShareSheet) return;
    const handleEsc = (e) => { if (e.key === 'Escape') handleCloseSheet(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showShareSheet, handleCloseSheet]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userDetails?.name || profileDetails?.handle}'s Flink`,
          text: `Check out my Flink profile`,
          url: profileUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    }
  };

  const handleShareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(`Check out my Flink profile: ${profileUrl}`)}`);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my Flink profile: ${profileUrl}`)}`);
  };

  const userName = userDetails?.name || profileDetails?.handle || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="mb-6">
      <h2
        className={`text-base font-semibold mb-3 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Quick Actions
      </h2>
      <div className="flex gap-2">
        {/* Social Links */}
        <button
          onClick={handleSocialLinksClick}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
            isDark
              ? "bg-slate-800/40 border border-slate-700 text-gray-300 hover:bg-slate-800/60"
              : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-1">
              <Link className="w-4 h-4" />
              <span className="font-medium">Social Links</span>
            </div>
            <span className="text-xs opacity-60">Update</span>
          </div>
        </button>

        {/* Share Flink */}
        <button
          onClick={handleShareClick}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
            isDark
              ? "bg-slate-800/40 border border-slate-700 text-gray-300 hover:bg-slate-800/60"
              : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-1">
              <Share2 className="w-4 h-4" />
              <span className="font-medium">Share Flink</span>
            </div>
            <span className="text-xs opacity-60">QR Code</span>
          </div>
        </button>
      </div>

      {/* Instagram-Style Share Bottom Sheet */}
      {showShareSheet && (
        <div
          className={`fixed inset-0 z-50 transition-colors duration-300 ${
            isAnimating ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"
          }`}
          onClick={handleCloseSheet}
        >
          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ease-out ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`rounded-t-3xl ${
                isDark
                  ? "bg-slate-900 border-t border-slate-700"
                  : "bg-white border-t border-gray-100"
              }`}
              style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div
                  className={`w-10 h-1 rounded-full ${
                    isDark ? "bg-slate-600" : "bg-gray-300"
                  }`}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Share Profile
                </h3>
                <button
                  onClick={handleCloseSheet}
                  className={`p-2 rounded-full transition-colors ${
                    isDark
                      ? "bg-slate-800 text-gray-400 hover:text-white"
                      : "bg-gray-100 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card Preview */}
              <div className="px-5 pb-5">
                <div
                  className={`flex items-center p-4 rounded-2xl ${
                    isDark
                      ? "bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700"
                      : "bg-gradient-to-r from-gray-50 to-white border border-gray-200"
                  }`}
                >
                  {/* Avatar */}
                  {userDetails?.profile_url ? (
                    <img
                      src={userDetails.profile_url}
                      alt="Profile"
                      loading="lazy"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-blue-500/30">
                      {userInitial}
                    </div>
                  )}

                  <div className="ml-4 flex-1 min-w-0">
                    <p
                      className={`font-semibold text-base truncate ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {userName}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      flink.to/{profileDetails?.handle || "your-handle"}
                    </p>
                  </div>

                  {/* QR Mini */}
                  <div className="ml-3 p-2 bg-white rounded-xl shadow-sm">
                    <QRCodeImg value={profileUrl} size={48} className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* Share Options Row */}
              <div className="px-5 pb-5">
                <div className="flex justify-around">
                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-active:scale-90 ${
                        copied
                          ? "bg-green-500 text-white"
                          : isDark
                          ? "bg-slate-800 text-gray-300 border border-slate-700"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        copied
                          ? "text-green-500"
                          : isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>

                  {/* QR Code */}
                  <button
                    onClick={() => {
                      // Open QR full view by scrolling down or toggling a state
                      const qrSection = document.getElementById('qr-full-view');
                      qrSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-active:scale-90 ${
                        isDark
                          ? "bg-slate-800 text-gray-300 border border-slate-700"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      QR Code
                    </span>
                  </button>

                  {/* Messages / SMS */}
                  <button
                    onClick={handleShareSMS}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-active:scale-90 ${
                        isDark
                          ? "bg-slate-800 text-gray-300 border border-slate-700"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Message
                    </span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-active:scale-90 ${
                        isDark
                          ? "bg-green-900/40 text-green-400 border border-green-800/50"
                          : "bg-green-50 text-green-600 border border-green-200"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.381-2.147l-.446-.334-3.138 1.052 1.052-3.138-.334-.446A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                      </svg>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      WhatsApp
                    </span>
                  </button>

                  {/* Native Share (if supported) */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className="flex flex-col items-center group"
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-active:scale-90 ${
                          isDark
                            ? "bg-blue-900/40 text-blue-400 border border-blue-800/50"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                      >
                        <Send className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        More
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Full QR Code Section */}
              <div id="qr-full-view" className="px-5 pb-4">
                <div
                  className={`p-5 rounded-2xl text-center ${
                    isDark
                      ? "bg-slate-800/60 border border-slate-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-3">
                    <QRCodeImg value={profileUrl} size={160} className="w-40 h-40" />
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Scan to connect
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Point your camera at the QR code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsSection;
