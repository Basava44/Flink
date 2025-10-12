import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
// import ThemeToggle from "../components/ThemeToggle";

function Dashboard() {
  const navigate = useNavigate();
  const { user, userDetails, signOut } = useAuth();
  const { isDark } = useTheme();

  const handleSignOut = async () => {
    try {
      console.log('Dashboard: Starting sign out...');
      const { error } = await signOut();
      console.log('Dashboard: Sign out result:', { error });
      
      if (error) {
        console.error("Error signing out:", error);
        // You might want to show an error message to the user here
        return;
      }
      
      console.log('Dashboard: Sign out successful, redirecting to home');
      navigate('/');
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold brand-font mb-2">
              Welcome to Flink
            </h1>
            <p className={`text-lg ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
          >
            Sign Out
          </button>
        </header>

        {/* User Details Section */}
        {userDetails && (
          <div className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50" 
              : "bg-white border border-gray-200"
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              User Details from Database
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  User ID:
                </span>
                <p className={`${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  {userDetails.id}
                </p>
              </div>
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Email:
                </span>
                <p className={`${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  {userDetails.email || user?.email}
                </p>
              </div>
              {userDetails.created_at && (
                <div>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Created At:
                  </span>
                  <p className={`${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    {new Date(userDetails.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {userDetails.updated_at && (
                <div>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Updated At:
                  </span>
                  <p className={`${
                    isDark ? "text-white" : "text-gray-800"
                  }`}>
                    {new Date(userDetails.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <pre className={`text-xs p-4 rounded-lg overflow-auto ${
                isDark 
                  ? "bg-slate-900 text-gray-300" 
                  : "bg-gray-100 text-gray-700"
              }`}>
                {JSON.stringify(userDetails, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30" 
              : "bg-white border border-gray-200 hover:border-primary-300"
          }`}>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Profile Setup
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Complete your profile to get started
            </p>
            <button className="text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors duration-200">
              Set up profile →
            </button>
          </div>

          {/* Social Links Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-accent-500/30" 
              : "bg-white border border-gray-200 hover:border-accent-300"
          }`}>
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Add Social Links
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Connect your social media accounts
            </p>
            <button className="text-accent-600 hover:text-accent-500 font-medium text-sm transition-colors duration-200">
              Add links →
            </button>
          </div>

          {/* Share Flink Card */}
          <div className={`p-6 rounded-2xl transition-all duration-200 hover:scale-105 ${
            isDark 
              ? "bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30" 
              : "bg-white border border-gray-200 hover:border-primary-300"
          }`}>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Share Your Flink
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Get your unique link and QR code
            </p>
            <button className="text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors duration-200">
              Get link →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-800"
          }`}>
            Quick Stats
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Profile Views
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Social Links
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Link Clicks
              </div>
            </div>
            <div className={`p-6 rounded-2xl text-center ${
              isDark 
                ? "bg-slate-800/50 border border-slate-700/50" 
                : "bg-white border border-gray-200"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                0
              </div>
              <div className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Connections
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;