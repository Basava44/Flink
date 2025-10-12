# Flink - Social Media Hub 🚀

A modern social media aggregation platform built with React, Vite, Tailwind CSS, and Supabase.

## Features ✨

- **Authentication System**: Complete user authentication with Supabase
  - Email/Password sign up and login
  - Google OAuth integration
  - Password reset functionality
  - Session management with auto-refresh
  
- **Responsive Design**: 
  - **Home page**: Full responsive design for all screen sizes
  - **App screens**: Mobile-only design (Login, Dashboard, etc.)
  - Automatic detection and appropriate messaging for desktop users
- **Dark/Light Theme**: Toggle between dark and light themes (Home page)
- **Dashboard**: User dashboard for managing social links (Mobile-only)

## Backend Integration 🔧

The application uses **Supabase** as the backend-as-a-service platform, providing:

### Authentication Features:
1. **Email/Password Authentication**
   - User registration with email verification
   - Secure login/logout
   - Remember me functionality

2. **OAuth Integration**
   - Google Sign-In
   - Automatic redirect handling

3. **Password Management**
   - Forgot password functionality
   - Secure password reset via email
   - Password update system

4. **Session Management**
   - Persistent sessions stored in localStorage
   - Automatic token refresh
   - Session detection from URL parameters

## Project Structure 📁

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx
│   └── ThemeToggle.jsx
├── contexts/           # React context providers
│   ├── AuthContext.jsx     # Authentication state management
│   └── AuthContextType.js  # Context type definition
├── hooks/              # Custom React hooks
│   ├── useAuth.js         # Authentication hook
│   └── useTheme.js        # Theme management hook
├── lib/                # External service configurations
│   └── supabase.js        # Supabase client setup
├── pages/              # Application pages
│   ├── Dashboard.jsx      # User dashboard (authenticated)
│   ├── ForgotPassword.jsx # Password reset request
│   ├── Home.jsx          # Landing page
│   ├── Login.jsx         # Login/Signup page
│   └── ResetPassword.jsx # Password reset form
└── utils/              # Utility functions
    └── constants.js
```

## Setup Instructions 🛠

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd flink
npm install
```

### 2. Environment Configuration

Your `.env` file is already configured with:

```env
VITE_SUPABASE_URL="https://qrdihaipyzvelwhvyjwc.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Supabase Setup

1. Your Supabase project is already configured
2. **Email Authentication** is enabled
3. Configure **Google OAuth** in **Authentication > Providers** if needed

### 4. Configure Email Authentication

In your Supabase dashboard:
1. Go to **Authentication > Settings**
2. Configure your **Site URL** (e.g., `http://localhost:5173` for development)
3. Add redirect URLs for password reset: `http://localhost:5173?type=recovery`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application!

## Authentication Flow 🔄

### Registration Process:
1. User fills registration form on login page
2. Supabase sends confirmation email
3. User clicks email link to verify account
4. User can now sign in

### Login Process:
1. User enters credentials on login page
2. Supabase validates credentials
3. Session is created and stored
4. User redirected to dashboard

### Password Reset:
1. User clicks "Forgot Password" on login page
2. Enters email on forgot password page
3. Supabase sends reset email with recovery link
4. User clicks email link (contains `?type=recovery`)
5. App detects recovery type and shows reset password form
6. User enters new password and submits

### Google OAuth:
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent
3. On success, redirected back to app with session

## Key Components 📋

### AuthContext (`src/contexts/AuthContext.jsx`)
- Manages global authentication state
- Provides authentication methods (login, signup, logout, etc.)
- Handles session persistence and refresh
- Listens to auth state changes

### useAuth Hook (`src/hooks/useAuth.js`)
- Custom hook for accessing authentication context
- Provides clean API for components to use auth functions

### Login Component (`src/pages/Login.jsx`)
- Unified login/signup form with toggle
- Form validation and error handling
- Loading states and user feedback
- Google OAuth integration
- Password confirmation for signup

### Dashboard Component (`src/pages/Dashboard.jsx`)
- Protected route for authenticated users
- User profile display
- Social links management (placeholder)
- Statistics dashboard

## Security Features 🔒

- **Row Level Security (RLS)**: Supabase handles user data isolation
- **JWT Tokens**: Secure session management with automatic refresh
- **Email Verification**: Required for account activation
- **Password Validation**: Client-side and server-side validation
- **Protected Routes**: Authentication-based navigation

## Current Implementation Status ✅

✅ **Completed Features:**
- Supabase client configuration
- Authentication context and hooks
- Login/Signup page with form validation (Mobile-only)
- Forgot password functionality (Mobile-only)
- Reset password page (Mobile-only)
- Dashboard for authenticated users (Mobile-only)
- Session management and persistence
- Route protection and navigation
- Error handling and user feedback
- Loading states and UI feedback
- **Responsive Design Strategy:**
  - Home page: Full responsive design for desktop and mobile
  - All app screens: Mobile-only with desktop warning messages

🚧 **Next Steps:**
- Database schema for user profiles and social links
- Profile management functionality
- Social link CRUD operations
- Link sharing and QR code generation
- Analytics and click tracking
- Profile customization

## Testing the Integration 🧪

1. **Start the development server**: `npm run dev`

2. **Test Responsive Design**:
   - **Desktop**: Home page should display fully, other pages show mobile-only warning
   - **Mobile/Narrow browser**: All pages should work normally
   - Try resizing browser window to test breakpoints

3. **Test Registration** (Mobile/narrow browser):
   - Go to login page
   - Toggle to "Create Account"
   - Fill in email and password
   - Submit form
   - Check email for verification link

4. **Test Login** (Mobile/narrow browser):
   - Use registered email and password
   - Should redirect to dashboard upon success

5. **Test Forgot Password** (Mobile/narrow browser):
   - Click "Forgot password?" on login page
   - Enter email address
   - Check email for reset link
   - Click link to reset password

6. **Test Google OAuth** (if configured):
   - Click "Continue with Google"
   - Complete OAuth flow
   - Should return to app with active session

7. **Test Desktop Warning Messages**:
   - Access login, dashboard, or password reset on desktop
   - Should see mobile-only warning message with "Back to Home" button

## Troubleshooting 🔧

### Common Issues:

1. **Node.js Version**: Ensure you're using Node.js 20.19+
2. **Email Not Sending**: Check Supabase email settings
3. **OAuth Issues**: Verify redirect URLs in Supabase
4. **Session Issues**: Clear localStorage and try again

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Your Flink app is now ready!** 🎉 

The backend integration with Supabase is complete. You can now:
- Register new users
- Login existing users
- Reset passwords
- Manage sessions
- Access the dashboard

Next, you'll want to design your database schema for user profiles and social links, then build the core Flink functionality!

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
