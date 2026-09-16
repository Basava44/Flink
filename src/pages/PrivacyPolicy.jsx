import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ArrowLeft, Sun, Moon } from "lucide-react";

function PrivacyPolicy() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  useDocumentMeta({ title: "Privacy Policy", path: "/privacy" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sectionClass = `text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`;
  const headingClass = `text-lg font-semibold mb-3 ${isDark ? "text-zinc-100" : "text-zinc-900"}`;

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}>
      {/* Nav */}
      <nav className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Flink
          </span>
        </button>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 pt-8 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className={`text-sm mb-12 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          Last updated: September 16, 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className={headingClass}>1. Information we collect</h2>
            <div className={sectionClass}>
              <p className="mb-3">When you use Flink, we collect the following information:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account information</strong> - your name, email address, and password (or Google account details if you use Google sign-in).</li>
                <li><strong>Profile information</strong> - your chosen handle, display name, bio, avatar photo, and location.</li>
                <li><strong>Social links</strong> - the platform names, URLs, and labels you add to your profile.</li>
                <li><strong>Usage data</strong> - basic analytics like page views, collected automatically by our hosting provider.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>2. How we use your information</h2>
            <div className={sectionClass}>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To create and maintain your account.</li>
                <li>To display your public profile to visitors who access your Flink URL.</li>
                <li>To send transactional emails (password resets, account confirmations).</li>
                <li>To improve and maintain the service.</li>
              </ul>
              <p className="mt-3">We do not sell your personal information. We do not send marketing emails.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>3. Third-party services</h2>
            <div className={sectionClass}>
              <p className="mb-3">Flink uses the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Supabase</strong> - for authentication, database, and file storage (avatar images).</li>
                <li><strong>Google OAuth</strong> - if you choose to sign in with Google.</li>
                <li><strong>Vercel</strong> - for hosting the application.</li>
              </ul>
              <p className="mt-3">Each of these services has their own privacy policy governing how they handle your data.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>4. Data storage and security</h2>
            <div className={sectionClass}>
              <p>Your data is stored securely using Supabase with row-level security policies. Passwords are hashed and never stored in plain text. We use HTTPS for all data transmission. While we take reasonable measures to protect your information, no method of electronic storage is 100% secure.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>5. Your public profile</h2>
            <div className={sectionClass}>
              <p>Your Flink profile (handle, display name, bio, avatar, and social links) is publicly accessible by design - that is the core purpose of the service. If you do not want information to be public, do not add it to your profile.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>6. Local storage</h2>
            <div className={sectionClass}>
              <p>We use your browser's local storage to cache your session and profile data for faster loading. This data stays on your device and is not transmitted to third parties. You can clear this data at any time through your browser settings.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>7. Data deletion</h2>
            <div className={sectionClass}>
              <p>You can delete your account and all associated data at any time from the Settings page. Upon deletion, we remove your profile, social links, avatar, and account information. Some data may persist in backups for a limited period before being automatically purged.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>8. Children's privacy</h2>
            <div className={sectionClass}>
              <p>Flink is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us so we can delete it.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>9. Changes to this policy</h2>
            <div className={sectionClass}>
              <p>We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the "Last updated" date at the top of this page.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>10. Contact</h2>
            <div className={sectionClass}>
              <p>If you have questions about this Privacy Policy or want to request data deletion, please reach out through the Help page in your account settings.</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 px-5 border-t ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
        <div className="max-w-3xl mx-auto text-center">
          <p className={`text-xs ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
            &copy; {new Date().getFullYear()} Flink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;
