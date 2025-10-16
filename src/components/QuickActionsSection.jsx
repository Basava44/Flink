import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Link, Share2, X, Copy, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection = ({ profileDetails }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showQRCode, setShowQRCode] = useState(false);
  
  const handleSocialLinksClick = () => {
    navigate('/settings');
  };

  const handleShareClick = () => {
    setShowQRCode(true);
  };

  const handleCloseQR = () => {
    setShowQRCode(false);
  };

  const handleCopyLink = async () => {
    const profileUrl = `https://flink.to/${profileDetails?.handle || 'your-handle'}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateQRCode = (text) => {
    // Simple QR code generation using a web service
    const qrSize = 200;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(text)}`;
    return qrUrl;
  };

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

      {/* QR Code Popup Modal */}
      {showQRCode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCloseQR}
        >
          <div 
            className={`relative p-6 rounded-2xl max-w-sm w-full mx-4 ${
              isDark ? "bg-slate-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseQR}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* QR Code Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <QrCode className={`w-6 h-6 mr-2 ${
                  isDark ? "text-primary-400" : "text-primary-600"
                }`} />
                <h3 className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  Share Your Flink
                </h3>
              </div>

              {/* QR Code Image */}
              <div className="mb-4 p-4 bg-white rounded-xl">
                <img
                  src={generateQRCode(`https://flink.to/${profileDetails?.handle || 'your-handle'}`)}
                  alt="QR Code for Flink Profile"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              {/* Profile URL */}
              <div className={`mb-4 p-3 rounded-lg ${
                isDark ? "bg-slate-700" : "bg-gray-100"
              }`}>
                <p className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  https://flink.to/{profileDetails?.handle || 'your-handle'}
                </p>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-primary-600 hover:bg-primary-700 text-white"
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </button>

              <p className={`text-xs mt-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Scan QR code or share the link to connect
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsSection;
