import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Link, MousePointer, FileText } from 'lucide-react';

const QuickStatsSection = ({ socialLinks, profileDetails }) => {
  const { isDark } = useTheme();

  return (
    <div className="mt-8">
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Quick Stats
      </h2>
      <div
        className={`text-center p-4 rounded-lg ${
          isDark
            ? "bg-slate-800/20 border border-slate-700/30"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex justify-center items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <Link
              className={`w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span
              className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              {socialLinks.length} links
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <MousePointer
              className={`w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span
              className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              0 clicks
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText
              className={`w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span
              className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              {profileDetails ? "1" : "0"} profile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsSection;
