// Mock fixture data for local development without Supabase

const MOCK_USER_ID = "mock-user-001";
const MOCK_FRIEND_ID = "mock-user-002";
const MOCK_FRIEND2_ID = "mock-user-003";

export const mockAuthUser = {
  id: MOCK_USER_ID,
  email: "demo@flink.local",
  email_confirmed_at: "2025-01-01T00:00:00Z",
  confirmed_at: "2025-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Demo User" },
  created_at: "2025-01-01T00:00:00Z",
};

export const mockSession = {
  user: mockAuthUser,
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400,
};

export const mockUsers = [
  {
    id: MOCK_USER_ID,
    email: "demo@flink.local",
    name: "Demo User",
    profile_url: null,
    first_login: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: MOCK_FRIEND_ID,
    email: "alex@flink.local",
    name: "Alex Johnson",
    profile_url: null,
    first_login: false,
    created_at: "2025-01-15T00:00:00Z",
  },
  {
    id: MOCK_FRIEND2_ID,
    email: "sam@flink.local",
    name: "Sam Rivera",
    profile_url: null,
    first_login: false,
    created_at: "2025-02-01T00:00:00Z",
  },
];

export const mockFlinkProfiles = [
  {
    id: 1,
    user_id: MOCK_USER_ID,
    handle: "demo",
    bio: "Just a demo user exploring Flink!",
    location: "San Francisco, CA",
    is_private: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    user_id: MOCK_FRIEND_ID,
    handle: "alexj",
    bio: "Software developer & coffee enthusiast",
    location: "New York, NY",
    is_private: false,
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
  {
    id: 3,
    user_id: MOCK_FRIEND2_ID,
    handle: "samr",
    bio: "Designer & creative thinker",
    location: "Austin, TX",
    is_private: false,
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
];

export const mockSocialLinks = [
  {
    id: 1,
    user_id: MOCK_USER_ID,
    platform: "github",
    url: "https://github.com/demo",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    user_id: MOCK_USER_ID,
    platform: "twitter",
    url: "https://twitter.com/demo",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 3,
    user_id: MOCK_USER_ID,
    platform: "linkedin",
    url: "https://linkedin.com/in/demo",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 4,
    user_id: MOCK_USER_ID,
    platform: "email",
    url: "mailto:demo@flink.local",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 5,
    user_id: MOCK_FRIEND_ID,
    platform: "github",
    url: "https://github.com/alexj",
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
  {
    id: 6,
    user_id: MOCK_FRIEND2_ID,
    platform: "instagram",
    url: "https://instagram.com/samr",
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
];

export const mockConnections = [
  {
    id: "conn-001",
    sender_id: MOCK_USER_ID,
    receiver_id: MOCK_FRIEND_ID,
    status: "accepted",
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z",
  },
  {
    id: "conn-002",
    sender_id: MOCK_FRIEND2_ID,
    receiver_id: MOCK_USER_ID,
    status: "pending",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-01T00:00:00Z",
  },
];
