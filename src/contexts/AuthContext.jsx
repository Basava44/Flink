import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContextType";
import { getAvatarStoragePath } from "../utils/avatarStorage";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check for cached session first to avoid API call
    const getCachedSession = () => {
      try {
        const cachedSession = localStorage.getItem("sb-session");
        if (cachedSession) {
          const session = JSON.parse(cachedSession);
          if (session?.user && session.expires_at > Date.now() / 1000) {
            setUser(session.user);
            setLoading(false);
            return true;
          }
        }
      } catch {
        // // console.log("Error reading cached session");
      }
      return false;
    };

    // Get initial session with fallback to cache
    const getInitialSession = async () => {
      try {
        // First try cached session for immediate response
        if (getCachedSession()) {
          // Still fetch fresh session in background
          supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
              if (session?.user) {
                setUser(session.user);
                // Cache the session
                localStorage.setItem(
                  "sb-session",
                  JSON.stringify({
                    user: session.user,
                    expires_at: session.expires_at,
                  })
                );
              }
            })
            .catch(() => {
              // // console.log("Background session fetch failed");
            });
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Cache the session if valid
        if (session?.user) {
          localStorage.setItem(
            "sb-session",
            JSON.stringify({
              user: session.user,
              expires_at: session.expires_at,
            })
          );
        }

        setLoading(false);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsPasswordRecovery(event === "PASSWORD_RECOVERY");

      // Cache the session if valid
      if (session?.user) {
        localStorage.setItem(
          "sb-session",
          JSON.stringify({
            user: session.user,
            expires_at: session.expires_at,
          })
        );
      } else {
        // Clear cached session on sign out
        localStorage.removeItem("sb-session");
      }

      // Handle user signup and signin
      if (session?.user && (event === "SIGNED_IN" || event === "SIGNED_UP")) {
        // For OAuth users (Google), add them to database immediately
        // For email signups, they should already be added in the signUp function
        if (
          event === "SIGNED_IN" ||
          (event === "SIGNED_UP" &&
            (session.user.email_confirmed_at || session.user.confirmed_at))
        ) {
          addUserToDatabase(session.user).then(({ error }) => {
            if (error) {
              console.error("Failed to add user to database:", error);
            } else {
              // // console.log("User successfully added to database");
            }
          });
        } else {
          // // console.log(
          //   "User not yet confirmed, skipping database insertion (will be handled after confirmation)"
          // );
        }

        // Then fetch user details (non-blocking)
        getUserDetails(session.user.id).catch(() => {
          // // console.log("Error fetching user details (non-critical)");
        });
      } else if (!session?.user) {
        // Clear user details when user signs out
        // // console.log("User signed out, clearing user details...");
        setUserDetails(null);
      }

      setLoading(false);
    });

    // Reduced timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // Reduced to 2 second timeout

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // The auth subscription is intentionally registered once for the provider
    // lifetime. The referenced helpers are stable callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add user to users table after successful signup
  const addUserToDatabase = useCallback(async (user, additionalData = {}) => {
    try {
      // First check if user already exists by ID
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingUser) {
        return { data: existingUser, error: null };
      }

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if user exists:", checkError);
        return { data: null, error: checkError };
      }

      const userData = {
        id: user.id,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          additionalData.name ||
          null,
        profile_url:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          additionalData.profile_url ||
          null,
        first_login: true,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error("Error adding user to database:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error adding user to database:", err);
      return { data: null, error: err };
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email, password, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: additionalData,
      },
    });

    // If signup is successful and we have a user, add them to the database immediately
    if (data?.user && !error) {
      addUserToDatabase(data.user, additionalData).then(
        ({ error: dbError }) => {
          if (dbError) {
            console.error(
              "Failed to add user to database after signup:",
              dbError
            );
          } else {
            // // console.log("User successfully added to database after signup");
          }
        }
      );
    }

    return { data, error };
  }, [addUserToDatabase]);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    // Note: For OAuth, the user will be added via the auth state change listener
    // when they return from the OAuth redirect
    return { data, error };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Manually clear all auth-related data first
      localStorage.removeItem("sb-session");
      localStorage.clear(); // Clear all cached data

      // Manually clear state immediately
      setUser(null);
      setUserDetails(null);

      // Try to sign out from Supabase (ignore errors)
      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== "Auth session missing!") {
          // Only log non-session missing errors
          console.error("Error signing out:", error);
        }
      } catch (_signOutError) {
        // ignored
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      // Even on error, clear local state
      setUser(null);
      setUserDetails(null);
      localStorage.clear();
      return { error: null }; // Don't return error to avoid blocking UI
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }, []);

  // Cache helpers
  const cacheGet = useCallback((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      // Cache valid for 10 minutes
      if (Date.now() - ts > 10 * 60 * 1000) return null;
      return data;
    } catch {
      // ignored
      return null;
    }
  }, []);

  const cacheSet = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // ignored
    }
  }, []);

  const cacheClear = useCallback((userId) => {
    try {
      localStorage.removeItem(`flink_user_${userId}`);
      localStorage.removeItem(`flink_social_${userId}`);
      localStorage.removeItem(`flink_profile_${userId}`);
    } catch {
      // ignored
    }
  }, []);

  // Get user details from users table
  const getUserDetails = useCallback(async (userId) => {
    try {
      // Load from cache instantly
      const cached = cacheGet(`flink_user_${userId}`);
      if (cached) setUserDetails(cached);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user details:", error);
        return { data: cached || null, error };
      }

      const details = {
        ...data,
        email: user?.id === userId ? user.email : undefined,
      };
      setUserDetails(details);
      cacheSet(`flink_user_${userId}`, details);
      return { data: details, error: null };
    } catch (err) {
      console.error("Unexpected error fetching user details:", err);
      return { data: null, error: err };
    }
  }, [cacheGet, cacheSet, user]);

  // Get user's social links
  const getSocialLinks = useCallback(async (userId) => {
    try {
      const cached = cacheGet(`flink_social_${userId}`);

      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", userId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching social links:", error);
        return { data: cached || null, error };
      }

      cacheSet(`flink_social_${userId}`, data);
      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error fetching social links:", err);
      return { data: null, error: err };
    }
  }, [cacheGet, cacheSet]);

  // Get user's profile details
  const getProfileDetails = useCallback(async (userId) => {
    try {
      const cached = cacheGet(`flink_profile_${userId}`);

      const { data, error } = await supabase
        .from("flink_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile details:", error);
        return { data: cached || null, error };
      }

      cacheSet(`flink_profile_${userId}`, data);
      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error fetching profile details:", err);
      return { data: null, error: err };
    }
  }, [cacheGet, cacheSet]);

  // Delete user account
  const deleteAccount = useCallback(async () => {
    try {
      if (!user?.id) {
        return { error: new Error("Not authorized") };
      }

      const avatarPaths = new Set();
      const { data: profile, error: profileError } = await supabase
        .from("flink_profiles")
        .select("profile_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error finding avatar before account deletion:", profileError);
        return { error: profileError };
      }

      const currentAvatarPath = getAvatarStoragePath(profile?.profile_url);
      if (currentAvatarPath) avatarPaths.add(currentAvatarPath);

      // Legacy uploads were stored at the bucket root. RLS limits this list to
      // objects owned by the current user.
      const { data: legacyAvatarFiles, error: legacyListError } = await supabase.storage
        .from("avatars")
        .list("", { limit: 1000 });

      if (legacyListError) {
        console.error("Error listing legacy avatars before account deletion:", legacyListError);
        return { error: legacyListError };
      }

      legacyAvatarFiles
        ?.filter((file) => file.id !== null)
        .forEach((file) => avatarPaths.add(file.name));

      const { data: avatarFiles, error: listError } = await supabase.storage
        .from("avatars")
        .list(user.id, { limit: 1000 });

      if (listError) {
        console.error("Error listing avatars before account deletion:", listError);
        return { error: listError };
      }

      avatarFiles
        ?.filter((file) => file.id !== null)
        .forEach((file) => avatarPaths.add(`${user.id}/${file.name}`));

      if (avatarPaths.size > 0) {
        const { error: removeError } = await supabase.storage
          .from("avatars")
          .remove([...avatarPaths]);

        if (removeError) {
          console.error("Error deleting avatars:", removeError);
          return { error: removeError };
        }
      }

      const { error } = await supabase.rpc("delete_user_account");
      if (error) {
        console.error("Error deleting account:", error);
        return { error };
      }

      // Clear all local state and storage
      setUser(null);
      setUserDetails(null);
      localStorage.clear();

      // Sign out locally (auth user is already deleted server-side)
      try { await supabase.auth.signOut(); } catch {
        // ignored
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error deleting account:", err);
      return { error: err };
    }
  }, [user?.id]);

  // Test database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, profile_url, first_login, created_at")
        .limit(1);

      if (error) {
        console.error("Database connection test failed:", error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Database connection test error:", err);
      return { success: false, error: err };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    userDetails,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    deleteAccount,
    getUserDetails,
    addUserToDatabase,
    getSocialLinks,
    getProfileDetails,
    testDatabaseConnection,
    cacheClear,
    supabase,
  }), [user, userDetails, loading, isPasswordRecovery, signUp, signIn, signInWithGoogle, signOut,
       resetPassword, deleteAccount, getUserDetails, addUserToDatabase, getSocialLinks,
       getProfileDetails, testDatabaseConnection, cacheClear]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
