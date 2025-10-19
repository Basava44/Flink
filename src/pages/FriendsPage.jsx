import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import BackgroundPattern from "../components/BackgroundPattern";
import {
  getUserConnections,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  CONNECTION_STATUS,
} from "../lib/connections";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Smartphone,
} from "lucide-react";

const FriendsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("friends"); // "friends" or "requests"
  const [searchQuery, setSearchQuery] = useState("");

  // Real data from database
  const [friends, setFriends] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  // Load connection data on component mount
  useEffect(() => {
    const loadConnectionData = async () => {
      if (!user) return;

      try {
        const [friendsResult, pendingResult, sentResult] = await Promise.all([
          getUserConnections(user.id),
          getPendingRequests(user.id),
          getSentRequests(user.id),
        ]);

        if (friendsResult.data) {
          // Transform friends data to include user info
          const friendsData = friendsResult.data.map((connection) => {
            const otherUser =
              connection.sender_id === user.id
                ? connection.receiver
                : connection.sender;
            const profile = otherUser.flink_profiles?.[0] || {};
            return {
              id: otherUser.id,
              name: otherUser.name,
              handle: profile.handle || otherUser.id, // Use handle from flink_profiles
              profile_url: otherUser.profile_url,
              bio: profile.bio || "",
              location: profile.location || "",
              isOnline: false, // You can implement online status later
              mutualFriends: 0, // You can implement mutual friends calculation later
              status: connection.status,
              connectionId: connection.id,
            };
          });
          setFriends(friendsData);
        }

        // Combine pending and sent requests
        const allRequestsData = [];
        
        if (pendingResult.data) {
          const pendingData = pendingResult.data.map((connection) => {
            const profile = connection.sender.flink_profiles?.[0] || {};
            return {
              id: connection.sender.id,
              name: connection.sender.name,
              handle: profile.handle || connection.sender.id,
              profile_url: connection.sender.profile_url,
              bio: profile.bio || "",
              location: profile.location || "",
              isOnline: false,
              mutualFriends: 0,
              status: connection.status,
              connectionId: connection.id,
              requestType: 'received' // Incoming request
            };
          });
          allRequestsData.push(...pendingData);
        }

        if (sentResult.data) {
          const sentData = sentResult.data.map((connection) => {
            const profile = connection.receiver.flink_profiles?.[0] || {};
            return {
              id: connection.receiver.id,
              name: connection.receiver.name,
              handle: profile.handle || connection.receiver.id,
              profile_url: connection.receiver.profile_url,
              bio: profile.bio || "",
              location: profile.location || "",
              isOnline: false,
              mutualFriends: 0,
              status: connection.status,
              connectionId: connection.id,
              requestType: 'sent' // Outgoing request
            };
          });
          allRequestsData.push(...sentData);
        }

        setAllRequests(allRequestsData);
      } catch (error) {
        console.error("Error loading connection data:", error);
      }
    };

    loadConnectionData();
  }, [user]);

  // Filter data based on search query
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = allRequests.filter(
    (request) =>
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleUserClick = (handle) => {
    navigate(`/${handle}`);
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      const { error } = await acceptFriendRequest(connectionId);
      if (error) {
        console.error("Error accepting request:", error);
      } else {
        // Refresh the data
        const loadConnectionData = async () => {
          const [friendsResult, pendingResult] = await Promise.all([
            getUserConnections(user.id),
            getPendingRequests(user.id),
          ]);

          if (friendsResult.data) {
            const friendsData = friendsResult.data.map((connection) => {
              const otherUser =
                connection.sender_id === user.id
                  ? connection.receiver
                  : connection.sender;
              const profile = otherUser.flink_profiles?.[0] || {};
              return {
                id: otherUser.id,
                name: otherUser.name,
                handle: profile.handle || otherUser.id,
                profile_url: otherUser.profile_url,
                bio: profile.bio || "",
                location: profile.location || "",
                isOnline: false,
                mutualFriends: 0,
                status: connection.status,
                connectionId: connection.id,
              };
            });
            setFriends(friendsData);
          }

          if (pendingResult.data) {
            const pendingData = pendingResult.data.map((connection) => {
              const profile = connection.sender.flink_profiles?.[0] || {};
              return {
                id: connection.sender.id,
                name: connection.sender.name,
                handle: profile.handle || connection.sender.id,
                profile_url: connection.sender.profile_url,
                bio: profile.bio || "",
                location: profile.location || "",
                isOnline: false,
                mutualFriends: 0,
                status: connection.status,
                connectionId: connection.id,
              };
            });
            setAllRequests(pendingData);
          }
        };
        loadConnectionData();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      const { error } = await rejectFriendRequest(connectionId);
      if (error) {
        console.error("Error rejecting request:", error);
      } else {
        // Remove from all requests
        setAllRequests((prev) =>
          prev.filter((req) => req.connectionId !== connectionId)
        );
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };



  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="friends-page-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Friends page is designed for mobile devices. Please access it from
            your phone or resize your browser window.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div
        className={`friends-page-mobile min-h-screen relative md:hidden ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        <BackgroundPattern />

        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBack}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <Users
                    className={`w-5 h-5 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <h1
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Friends
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400 focus:border-primary-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 pb-4">
          <div
            className={`flex rounded-xl p-1 ${
              isDark ? "bg-slate-800" : "bg-gray-100"
            }`}
          >
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "friends"
                  ? isDark
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-primary-600 text-white shadow-lg"
                  : isDark
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "requests"
                  ? isDark
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-primary-600 text-white shadow-lg"
                  : isDark
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Requests ({allRequests.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-6">
          {activeTab === "friends" ? (
            <div className="space-y-3">
              {filteredFriends.length === 0 ? (
                <div
                  className={`text-center py-12 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No friends yet</p>
                  <p className="text-sm">
                    {searchQuery
                      ? "No friends match your search"
                      : "Start connecting with people!"}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      isDark
                        ? "bg-slate-800 border border-slate-700 hover:border-slate-600"
                        : "bg-white border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center space-x-3 flex-1 min-w-0"
                        onClick={() => handleUserClick(friend.handle)}
                      >
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          {friend.profile_url ? (
                            <img
                              src={friend.profile_url}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary-500"
                            />
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 border-primary-500 ${
                                isDark
                                  ? "bg-slate-700 text-white"
                                  : "bg-primary-100 text-primary-600"
                              }`}
                            >
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {/* Online Status */}
                          {friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {friend.name}
                          </h3>
                          <p
                            className={`text-sm truncate -mt-1 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            @{friend.handle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div
                  className={`text-center py-12 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No requests yet</p>
                  <p className="text-sm">
                    {searchQuery
                      ? "No requests match your search"
                      : "Your friend requests will appear here!"}
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      isDark
                        ? "bg-slate-800 border border-slate-700 hover:border-slate-600"
                        : "bg-white border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center space-x-3 flex-1 min-w-0"
                        onClick={() => handleUserClick(request.handle)}
                      >
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          {request.profile_url ? (
                            <img
                              src={request.profile_url}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary-500"
                            />
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 border-primary-500 ${
                                isDark
                                  ? "bg-slate-700 text-white"
                                  : "bg-primary-100 text-primary-600"
                              }`}
                            >
                              {request.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {/* Online Status */}
                          {request.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {request.name}
                          </h3>
                          <p
                            className={`text-sm truncate -mt-1 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            @{request.handle}
                          </p>
                          {/* Request Type Indicator */}
                          <p
                            className={`text-xs ${
                              request.requestType === 'received'
                                ? isDark ? "text-green-400" : "text-green-600"
                                : isDark ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            {request.requestType === 'received' ? 'Incoming Request' : 'Sent Request'}
                          </p>
                          {request.bio && (
                            <p
                              className={`text-xs truncate mt-1 ${
                                isDark ? "text-gray-500" : "text-gray-600"
                              }`}
                            >
                              {request.bio}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`text-xs ${
                                isDark ? "text-gray-500" : "text-gray-600"
                              }`}
                            >
                              {request.mutualFriends} mutual friends
                            </span>
                            {request.location && (
                              <>
                                <span
                                  className={`text-xs ${
                                    isDark ? "text-gray-600" : "text-gray-400"
                                  }`}
                                >
                                  •
                                </span>
                                <span
                                  className={`text-xs ${
                                    isDark ? "text-gray-500" : "text-gray-600"
                                  }`}
                                >
                                  {request.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {request.requestType === 'received' ? (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(request.connectionId)}
                              className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.connectionId)}
                              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-gray-400 text-white text-sm font-medium transition-all duration-200"
                          >
                            Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendsPage;
