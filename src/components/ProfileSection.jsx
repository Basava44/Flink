import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Globe, FileText, MapPin, User } from 'lucide-react';

const ProfileSection = ({ profileDetails }) => {
  const { isDark } = useTheme();

  if (!profileDetails) return null;

  return (
    <div
      className={`p-6 rounded-xl shadow-soft ${
        isDark
          ? "bg-slate-800 border border-slate-700"
          : "bg-white border border-gray-200"
      }`}
    >
      {/* Section Header */}
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Your Flink Profile
      </h2>

      {/* Flink Profile Link */}
      <div className={`text-center p-4 rounded-lg mb-4 ${
        isDark 
          ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30" 
          : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
      }`}>
        <a
          href={`https://flink.to/${profileDetails.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center space-x-2 text-lg font-semibold hover:scale-105 transition-transform duration-200 ${
            isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>flink.to/{profileDetails.handle}</span>
        </a>
      </div>

      {/* Profile Details - Compact Grid */}
      <div className="space-y-3">
        {profileDetails.bio && (
          <div className="flex items-start space-x-3">
            <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`} />
            <div className="flex-1">
              <span className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>Bio</span>
              <p className={`text-sm mt-0.5 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                {profileDetails.bio}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {profileDetails.location && (
            <div className="flex items-center space-x-2">
              <MapPin className={`w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <span className={`text-sm ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                {profileDetails.location}
              </span>
            </div>
          )}

          {profileDetails.website && (
            <div className="flex items-center space-x-2">
              <Globe className={`w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <a
                href={
                  profileDetails.website.startsWith("http")
                    ? profileDetails.website
                    : `https://${profileDetails.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm hover:underline ${
                  isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
                }`}
              >
                {profileDetails.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
