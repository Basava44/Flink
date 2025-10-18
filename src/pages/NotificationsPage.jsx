import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  ArrowLeft,
  Bell,
  X,
} from "lucide-react";

function NotificationsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Thanks for joining us. Start by setting up your profile.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      message: "Your Flink profile is now live and ready to share.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 3,
      message: "Check out our new analytics dashboard to track your link performance.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: 4,
      message: "We've detected a new login from a different device.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: "made-with-flink",
      message: "This notification system is powered by Flink's innovative platform.",
      timestamp: new Date(),
      permanent: true, // This notification cannot be deleted
    },
  ]);

  const handleBackClick = () => {
    navigate("/dashboard");
  };




  const deleteNotification = (id) => {
    // Don't allow deletion of permanent notifications
    if (id === "made-with-flink") return;
    
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };


  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Notifications are designed for mobile devices. Please access from your phone.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Mobile Notifications - Visible only on mobile */}
      <div className={`md:hidden min-h-screen relative ${isDark ? "text-white" : "text-gray-900"}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${
        isDark 
          ? "bg-slate-800 border-slate-700" 
          : "bg-white border-gray-200"
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Bell className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <h1 className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Notifications
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">

          {/* Notifications List */}
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className={`text-center py-8 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "bg-slate-800/30 border border-slate-700/30"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {notification.message}
                      </p>
                      <span className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    {/* Delete Button - Only show for non-permanent notifications */}
                    {!notification.permanent && (
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className={`p-1.5 rounded-md transition-all duration-200 ml-2 flex-shrink-0 ${
                          isDark
                            ? "hover:bg-slate-700 text-gray-400 hover:text-red-400"
                            : "hover:bg-gray-100 text-gray-500 hover:text-red-600"
                        }`}
                        title="Delete notification"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className={`text-xs ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}>
              <div className="opacity-60">
                Made with ❤️ by <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Flink</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default NotificationsPage;
