# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` — start dev server (localhost:5173)
- `npm run dev:mock` — start dev server with fixture data (no Supabase needed)
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview production build
- `npm run deploy` — build and deploy to GitHub Pages

## Stack
- React 19 + Vite 7 + Tailwind CSS 3
- Supabase (auth + database + RLS)
- React Router 7 (client-side routing, BrowserRouter)
- Lucide React (icons), EmailJS (email)
- Deployed to GitHub Pages via `gh-pages`

## Architecture

### Routing (`src/App.jsx`)
- `ProtectedRoute` wrapper redirects unauthenticated users to `/login`
- `/:handle` route serves both the logged-in user's own profile and public profiles
- Public routes: `/`, `/login`, `/forgot-password`, `/reset-password`
- Protected routes: `/settings`, `/help`, `/notifications`, `/friends`

### Auth Flow (`src/contexts/AuthContext.jsx`)
- `AuthProvider` wraps the entire app and manages user + userDetails state
- Uses a cached session in localStorage (`sb-session`) for instant load, then refreshes from Supabase in the background
- Exposes auth methods and user data through `AuthContext` → consumed via `useAuth()` hook
- Supports email/password and Google OAuth

### Data Layer (`src/lib/`)
- `supabase.js` — single Supabase client instance
- `connections.js` — user-to-user relationship operations (connect, pending, accept/reject) with in-memory caching
- `cache.js` — generic TTL-based in-memory cache (Map-based, auto-expiry)
- **All Supabase queries must go through `src/lib/`** — never call supabase directly from components

### Profile System
- `ProfilePage` (`src/pages/ProfilePage.jsx`) is the main hub — handles own profile (with dashboard, social links, quick actions, stats) and public profile viewing
- Composed of: `ProfileSection`, `SocialLinksSection`, `QuickActionsSection`, `QuickStatsSection`, `PublicProfileView`
- `OnboardingFlow` and `ProfileSetupForm`/`SocialHandlesForm` handle new user setup

### Responsive Design
- Home page: fully responsive for all screen sizes
- App screens (login, profile, settings): **mobile-first design** with desktop warning messages
- `src/utils/responsive.js` has responsive utilities

### Theme
- `ThemeContext` provides `isDark` + `toggleTheme`
- Dark mode uses Tailwind's `dark:` prefix classes

### Database
- `supabase/` contains SQL files for RLS policies (not managed by Supabase CLI migrations)
- Tables include user profiles, social links, and connections

## Conventions
- JSX components: PascalCase filenames; hooks/utils: camelCase
- Styling: Tailwind CSS utility classes only — no inline styles or CSS files
- Icons: lucide-react only — don't add other icon libraries
- State management: React Context only (no Redux)
- Environment variables in `.env` (prefixed `VITE_`), never committed
- Don't install new packages without asking first
- Keep components under ~150 lines; split if larger
- Run `npm run build` after significant changes to catch errors


<!-- SUPERBASE MCP Setup -->
<!-- {
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--supabase-url",
        "YOUR_SUPABASE_URL",
        "--supabase-key",
        "YOUR_SUPABASE_ANON_KEY"
      ]
    }
  }
} -->