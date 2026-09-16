import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ArrowLeft, Sun, Moon } from "lucide-react";

function TermsOfService() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  useDocumentMeta({ title: "Terms of Service", path: "/terms" });

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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className={`text-sm mb-12 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          Last updated: September 16, 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className={headingClass}>1. Acceptance of terms</h2>
            <div className={sectionClass}>
              <p>By creating an account or using Flink, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>2. What Flink is</h2>
            <div className={sectionClass}>
              <p>Flink is a free link-in-bio service that lets you create a public profile page with links to your social accounts and contact information. Your profile is accessible via a unique URL (e.g., flink.to/yourhandle).</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>3. Your account</h2>
            <div className={sectionClass}>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must provide accurate information when creating your account.</li>
                <li>You are responsible for keeping your login credentials secure.</li>
                <li>You must be at least 13 years old to use Flink.</li>
                <li>One person, one account. Automated or bulk account creation is not allowed.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>4. Acceptable use</h2>
            <div className={sectionClass}>
              <p className="mb-3">You agree not to use Flink to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Link to illegal content, malware, or phishing sites.</li>
                <li>Impersonate another person or organization.</li>
                <li>Harass, abuse, or harm others.</li>
                <li>Distribute spam or unsolicited content.</li>
                <li>Violate any applicable laws or regulations.</li>
                <li>Attempt to gain unauthorized access to other users' accounts or our systems.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>5. Your content</h2>
            <div className={sectionClass}>
              <p className="mb-3">You retain ownership of the content you add to your profile (bio, links, avatar). By using Flink, you grant us a limited license to display this content publicly on your profile page - that is the purpose of the service.</p>
              <p>You are solely responsible for the content on your profile and the links you share. We do not review or endorse user content.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>6. Handle policy</h2>
            <div className={sectionClass}>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Handles are available on a first-come, first-served basis.</li>
                <li>We reserve the right to reclaim handles that are inactive, infringing on trademarks, or violating these terms.</li>
                <li>Handle squatting (claiming handles with the intent to sell them) is not allowed.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>7. Service availability</h2>
            <div className={sectionClass}>
              <p>Flink is provided "as is" without warranties of any kind. We do our best to keep the service running, but we do not guarantee uninterrupted availability. We may modify, suspend, or discontinue the service at any time.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>8. Termination</h2>
            <div className={sectionClass}>
              <p className="mb-3">You can delete your account at any time from the Settings page. We may also suspend or terminate accounts that violate these terms.</p>
              <p>Upon termination, your profile will no longer be publicly accessible. Data deletion follows the process described in our Privacy Policy.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>9. Limitation of liability</h2>
            <div className={sectionClass}>
              <p>To the maximum extent permitted by law, Flink and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid to use Flink (which is zero - it's free).</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>10. Changes to these terms</h2>
            <div className={sectionClass}>
              <p>We may update these Terms of Service from time to time. Continued use of Flink after changes constitutes acceptance of the updated terms. We will update the "Last updated" date at the top of this page.</p>
            </div>
          </section>

          <section>
            <h2 className={headingClass}>11. Contact</h2>
            <div className={sectionClass}>
              <p>If you have questions about these Terms of Service, please reach out through the Help page in your account settings.</p>
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

export default TermsOfService;
