import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContextType";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log('AuthContext: Initial session result:', session?.user?.id ? 'User found' : 'No user');
        setUser(session?.user ?? null);
        
        // Fetch user details if user is already logged in (non-blocking)
        if (session?.user) {
          console.log('AuthContext: Fetching user details for:', session.user.id);
          getUserDetails(session.user.id).catch(err => {
            console.log('Error fetching user details (non-critical):', err);
          });
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
      
      // Fetch user details when user logs in or signs up
      if (session?.user && (event === 'SIGNED_IN' || event === 'SIGNED_UP')) {
        console.log('User signed in/up, fetching user details...');
        await getUserDetails(session.user.id);
      } else if (!session?.user) {
        // Clear user details when user signs out
        console.log('User signed out, clearing user details...');
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthContext: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

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
