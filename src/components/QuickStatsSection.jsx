import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Link, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickStatsSection = ({
  socialLinks,
  profileDetails,
  friends = 0,
  pendingRequests = 0,
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      <h2
        className={`text-base font-semibold mb-3 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Quick Stats
      </h2>
      <div
        className={`text-center p-3 rounded-lg ${
          isDark
            ? "bg-slate-800/30 border border-slate-700/50"
            : "bg-gray-100 border border-gray-200"
        }`}
      >
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-center space-x-1">
            <Link
              className={`w-3 h-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {socialLinks.length} links
            </span>
          </div>
          <div
            className="flex items-center justify-center space-x-1"
            onClick={() => navigate("/friends")}
          >
            <Users
              className={`w-3 h-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {friends} friends
            </span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <UserPlus
              className={`w-3 h-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {pendingRequests} requests
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsSection;
