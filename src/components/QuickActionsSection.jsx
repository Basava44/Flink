import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Link, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const handleSocialLinksClick = () => {
    navigate('/settings');
  };

  return (
    <div className="mb-8">
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Quick Actions
      </h2>
      <div className="flex gap-2">
        {/* Social Links */}
        <button
        onClick={handleSocialLinksClick}
          className={`flex-1 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
            isDark
              ? "bg-slate-800/30 border border-slate-700 text-gray-300 hover:bg-slate-800/50"
              : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Link className="w-4 h-4" />
            <span className="font-medium">Social Links</span>
          </div>
          <div className="text-center">
            <span className="text-xs opacity-60">Update</span>
          </div>
        </button>

        {/* Share Flink */}
        <div
          className={`flex-1 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
            isDark
              ? "bg-slate-800/30 border border-slate-700 text-gray-300 hover:bg-slate-800/50"
              : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Share Flink</span>
          </div>
          <div className="text-center">
            <span className="text-xs opacity-60">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;
