import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  userDetails: null,
  loading: true,
  signUp: () => {},
  signIn: () => {},
  signInWithGoogle: () => {},
  signOut: () => {},
  resetPassword: () => {},
  getUserDetails: () => {},
  addUserToDatabase: () => {},
  testDatabaseConnection: () => {},
  supabase: null,
});