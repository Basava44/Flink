import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, User } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const SearchOverlay = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search functions
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchLoading(true);
      setSearchResults(null);
      
      try {
        const searchTerm = searchQuery.trim().toLowerCase();
        
        // Search in flink_profiles table
        const { data: profiles, error } = await supabase
          .from('flink_profiles')
          .select(`
            *,
            users!inner(
              id,
              name,
              profile_url,
              created_at
            )
          `)
          .or(`handle.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .neq('user_id', user?.id) // Exclude current user's profile
          .limit(20);

        if (error) {
          console.error("Error searching profiles:", error);
          setSearchResults({ error: "Search failed" });
          return;
        }

        // Transform the data to match the expected format
        const searchUsers = profiles.map(profile => ({
          id: profile.user_id,
          name: profile.users.name || 'Unknown User', // Use name from users table
          handle: profile.handle, // Use handle from flink_profiles table
          profile_url: profile.users.profile_url,
          bio: profile.bio || '',
          isVerified: false, // You can add verification logic later
          created_at: profile.users.created_at
        }));

        setSearchResults({
          users: searchUsers,
          query: searchQuery.trim()
        });
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults({ error: "Search failed" });
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const closeSearchOverlay = () => {
    onClose();
    setSearchResults(null);
    setSearchQuery("");
  };

  const handleUserClick = (handle) => {
    navigate(`/${handle}`);
    closeSearchOverlay();
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay fixed inset-0 z-50">
      {/* Full-Screen Background */}
      <div className={`search-overlay-background absolute inset-0 ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}>
        {/* Header with Search Bar */}
        <div className={`sticky top-0 z-10 border-b ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center px-4 py-3">
            {/* Back Button */}
            <button
              onClick={closeSearchOverlay}
              className={`p-2 mr-3 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                id="profile-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search"
                className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                  isDark
                    ? "bg-slate-800 border border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                autoComplete="off"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={closeSearchOverlay}
              className={`ml-3 px-3 py-2 text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : searchResults && searchResults.error ? (
            <div className="text-center py-20 px-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? "bg-slate-700" : "bg-gray-100"
              }`}>
                <User className={`w-10 h-10 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                No results found
              </h3>
              <p className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Try searching for something else
              </p>
            </div>
          ) : searchResults && searchResults.users && searchResults.users.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? "bg-slate-700" : "bg-gray-100"
              }`}>
                <Search className={`w-10 h-10 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                No users found
              </h3>
              <p className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                No users match "{searchResults.query}"
              </p>
            </div>
          ) : searchResults && searchResults.users ? (
            <div className="py-2">
              {/* Users List */}
              {searchResults.users.map((user) => (
                <div 
                  key={user.id}
                  className={`flex items-center px-4 py-3 hover:bg-opacity-50 cursor-pointer transition-colors ${
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleUserClick(user.handle)}
                >
                  {/* Profile Picture */}
                  <div className="relative mr-3">
                    {user.profile_url ? (
                      <img
                        src={user.profile_url}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                        isDark
                          ? "bg-slate-700 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <h4 className={`text-sm font-semibold truncate ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {user.name}
                      </h4>
                      {user.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs truncate ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      @{user.handle}
                    </p>
                    {user.bio && (
                      <p className={`text-xs truncate mt-1 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.handle);
                    }}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? "bg-slate-700" : "bg-gray-100"
              }`}>
                <Search className={`w-10 h-10 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Search for users
              </h3>
              <p className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Enter a name, handle, or bio to find users
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
