import { createClient } from "@supabase/supabase-js";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

let supabase;

if (useMock) {
  // Dynamic import isn't needed — Vite tree-shakes the unused branch in production builds
  const mock = await import("./supabase-mock.js");
  supabase = mock.supabase;
  console.log("[Mock] Running with fixture data — no Supabase connection");
} else {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
