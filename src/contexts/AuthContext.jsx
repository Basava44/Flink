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
      
      // Handle user signup and signin
      if (session?.user && (event === 'SIGNED_IN' || event === 'SIGNED_UP')) {
        console.log('User signed in/up, handling user data...', { 
          event, 
          userId: session.user.id, 
          emailConfirmed: session.user.email_confirmed_at,
          userConfirmed: session.user.confirmed_at 
        });
        
        // For OAuth users (Google), add them to database immediately
        // For email signups, they should already be added in the signUp function
        if (event === 'SIGNED_IN' || (event === 'SIGNED_UP' && (session.user.email_confirmed_at || session.user.confirmed_at))) {
          console.log('Adding user to database via auth state change...');
          addUserToDatabase(session.user).then(({ error }) => {
            if (error) {
              console.error('Failed to add user to database:', error);
            } else {
              console.log('User successfully added to database');
            }
          });
        } else {
          console.log('User not yet confirmed, skipping database insertion (will be handled after confirmation)');
        }
        
        // Then fetch user details (non-blocking)
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
  const signUp = async (email, password, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: additionalData
      }
    });
    
    // If signup is successful and we have a user, add them to the database immediately
    if (data?.user && !error) {
      console.log('Signup successful, adding user to database immediately...');
      addUserToDatabase(data.user, additionalData).then(({ error: dbError }) => {
        if (dbError) {
          console.error('Failed to add user to database after signup:', dbError);
        } else {
          console.log('User successfully added to database after signup');
        }
      });
    }
    
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
    
    // Note: For OAuth, the user will be added via the auth state change listener
    // when they return from the OAuth redirect
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

  // Add user to users table after successful signup
  const addUserToDatabase = async (user, additionalData = {}) => {
    try {
      console.log('addUserToDatabase called with:', { 
        userId: user.id, 
        email: user.email, 
        metadata: user.user_metadata,
        additionalData 
      });

      // First check if user already exists in database
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingUser) {
        console.log('User already exists in database, skipping insertion');
        return { data: existingUser, error: null };
      }

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking if user exists:', checkError);
        return { data: null, error: checkError };
      }

      const userData = {
        id: user.id, // This will be the UUID from auth.users.id
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || additionalData.name || null,
        profile_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || additionalData.profile_url || null,
        first_login: true,
        created_at: new Date().toISOString()
      };

      console.log('Adding user to database with data:', userData);

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error adding user to database:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error };
      }

      console.log('User successfully added to database:', data);
      
      // Automatically add email as a social link for Google OAuth users
      if (user.email) {
        try {
          console.log('Adding email social link for user:', user.email);
          const { error: socialLinkError } = await supabase
            .from('social_links')
            .insert([{
              user_id: user.id,
              platform: 'email',
              url: `mailto:${user.email}`,
              private: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
          
          if (socialLinkError) {
            console.error('Error adding email social link:', socialLinkError);
          } else {
            console.log('Email social link added successfully for:', user.email);
          }
        } catch (err) {
          console.error('Unexpected error adding email social link:', err);
        }
      } else {
        console.log('No email found for user, skipping email social link');
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error adding user to database:', err);
      return { data: null, error: err };
    }
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

  // Get user's social links
  const getSocialLinks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching social links:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching social links:', err);
      return { data: null, error: err };
    }
  };

  // Get user's profile details
  const getProfileDetails = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('flink_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile details:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching profile details:', err);
      return { data: null, error: err };
    }
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, profile_url, first_login, created_at')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('Database connection test successful:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Database connection test error:', err);
      return { success: false, error: err };
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
    addUserToDatabase,
    getSocialLinks,
    getProfileDetails,
    testDatabaseConnection,
    supabase, // Expose supabase client for password reset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
