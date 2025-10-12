import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContextType";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for cached session first to avoid API call
    const getCachedSession = () => {
      try {
        const cachedSession = localStorage.getItem('sb-session');
        if (cachedSession) {
          const session = JSON.parse(cachedSession);
          if (session?.user && session.expires_at > Date.now() / 1000) {
            console.log('AuthContext: Using cached session');
            setUser(session.user);
            setLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.log('Error reading cached session:', error);
      }
      return false;
    };

    // Get initial session with fallback to cache
    const getInitialSession = async () => {
      try {
        // First try cached session for immediate response
        if (getCachedSession()) {
          // Still fetch fresh session in background
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              setUser(session.user);
              // Cache the session
              localStorage.setItem('sb-session', JSON.stringify({
                user: session.user,
                expires_at: session.expires_at
              }));
            }
          }).catch(err => console.log('Background session fetch failed:', err));
          return;
        }

        console.log('AuthContext: Getting fresh session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log('AuthContext: Initial session result:', session?.user?.id ? 'User found' : 'No user');
        setUser(session?.user ?? null);
        
        // Cache the session if valid
        if (session?.user) {
          localStorage.setItem('sb-session', JSON.stringify({
            user: session.user,
            expires_at: session.expires_at
          }));
        }
        
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session: session?.user?.id });
      setUser(session?.user ?? null);
      
      // Cache the session if valid
      if (session?.user) {
        localStorage.setItem('sb-session', JSON.stringify({
          user: session.user,
          expires_at: session.expires_at
        }));
      } else {
        // Clear cached session on sign out
        localStorage.removeItem('sb-session');
      }
      
      // Fetch user details when user logs in or signs up (non-blocking)
      if (session?.user && (event === 'SIGNED_IN' || event === 'SIGNED_UP')) {
        console.log('User signed in/up, fetching user details...');
        getUserDetails(session.user.id).catch(err => {
          console.log('Error fetching user details (non-critical):', err);
        });
      } else if (!session?.user) {
        // Clear user details when user signs out
        console.log('User signed out, clearing user details...');
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    // Reduced timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthContext: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 2000); // Reduced to 2 second timeout

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173",
      },
    });
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      const { error } = await supabase.auth.signOut();
      console.log('Supabase signOut result:', { error });
      
      if (error) {
        console.error('Error signing out:', error);
        return { error };
      }
      
      console.log('Sign out successful - auth state change listener will handle state clearing');
      // Note: We don't manually clear state here anymore
      // The auth state change listener will handle it automatically
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      return { error: err };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  // Get user details from users table
  const getUserDetails = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user details:', error);
        return { data: null, error };
      }
      
      setUserDetails(data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching user details:', err);
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    getUserDetails,
    supabase, // Expose supabase client for password reset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
