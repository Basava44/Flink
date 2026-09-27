// Application constants

// Canonical site URL - reads from env, falls back to production domain
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flink.to').replace(/\/$/, '');

// Display domain for UI (without protocol)
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

// Handles blocked at both UI and DB level (DB has a trigger too as defense-in-depth)
export const RESERVED_HANDLES = new Set([
  'settings', 'help', 'login', 'signup', 'register',
  'forgot-password', 'reset-password', 'privacy', 'terms',
  'admin', 'api', 'app', 'about', 'blog', 'contact',
  'dashboard', 'flink', 'home', 'notifications', 'friends',
  'search', 'explore', 'profile', 'edit', 'delete',
  'null', 'undefined', 'favicon.ico', 'robots.txt', 'sitemap.xml',
]);
