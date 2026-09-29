import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Sun,
  Moon,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

const faqs = [
  {
    question: 'What is Flink?',
    answer:
      'Flink is a free link-in-bio service that lets you create a clean, public profile page with all your social links and contact info in one place. Share a single URL and let people find you everywhere.',
  },
  {
    question: 'Can I change my handle?',
    answer:
      'Handles are permanent once set and cannot be changed. Choose carefully during setup, as your Flink URL is tied to your handle.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Head to Settings and scroll to the bottom. You will find a "Delete Account" option there. This will permanently remove your profile, social links, and all associated data.',
  },
  {
    question: 'Is Flink free?',
    answer:
      'Yes, Flink is free to use. You get a full profile page with all your social links at no cost. We also offer an optional Premium plan for users who want more.',
  },
  {
    question: 'What do I get with Premium?',
    answer:
      'Premium includes link analytics (see which links get clicked and how often), visitor analytics (track profile views, unique visitors, and trends over time), a verified premium badge on your profile, and an upgraded avatar ring. More features like custom themes are coming soon.',
  },
];

function FaqItem({ question, answer, isDark }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        isDark ? 'border-zinc-800' : 'border-zinc-200'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors ${
          isDark
            ? 'text-zinc-200 hover:bg-zinc-800/50'
            : 'text-zinc-800 hover:bg-zinc-50'
        }`}
      >
        {question}
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
        />
      </button>
      {open && (
        <div
          className={`px-5 pb-4 text-sm leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  useDocumentMeta({ title: 'Help & Support', path: '/help' });

  const [formData, setFormData] = useState({
    type: 'question',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userProfileHandle, setUserProfileHandle] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getUserProfileHandle = async () => {
      if (user?.id) {
        try {
          const { data: profileData } = await supabase
            .from('flink_profiles')
            .select('handle')
            .eq('user_id', user.id)
            .single();

          if (profileData?.handle) {
            setUserProfileHandle(profileData.handle);
          }
        } catch (err) {
          console.error('Error fetching profile handle:', err);
        }
      }
    };

    getUserProfileHandle();
  }, [user?.id]);

  const handleBack = () => {
    navigate(userProfileHandle ? `/${userProfileHandle}` : `/${user.id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error: submitError } = await supabase.rpc('submit_support_request', {
        p_type: formData.type,
        p_subject: formData.subject,
        p_message: formData.message,
        p_priority: formData.priority,
      });
      if (submitError) throw submitError;

      setSubmitStatus('success');

      setTimeout(() => {
        setFormData({
          type: 'question',
          subject: '',
          message: '',
          priority: 'medium',
        });
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus(
        error?.message?.toLowerCase().includes('wait') ? 'rate_limit' : 'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
      }`}
    >
      {/* Nav */}
      <nav className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft
            className={`w-4 h-4 ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          />
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Flink
          </span>
        </button>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 pt-8 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Help & Support
        </h1>
        <p
          className={`text-sm mb-12 ${
            isDark ? 'text-zinc-600' : 'text-zinc-400'
          }`}
        >
          Find answers or get in touch
        </p>

        {/* FAQ Section */}
        <div className="mb-14">
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-1 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            Send us a message
          </h2>
          <p
            className={`text-sm mb-6 ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            Have a question or suggestion? We would love to hear from you.
          </p>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                isDark
                  ? 'bg-green-900/20 border border-green-800 text-green-300'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>
                Your message has been sent successfully. Thank you for reaching
                out.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                isDark
                  ? 'bg-red-900/20 border border-red-800 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>There was an error sending your message. Please try again.</p>
            </div>
          )}

          {submitStatus === 'rate_limit' && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                isDark
                  ? 'bg-amber-900/20 border border-amber-800 text-amber-300'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Please wait before sending another message. You can submit once per minute.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                What is this about?
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors appearance-none ${
                  isDark
                    ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-100 focus:border-zinc-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-900 focus:border-zinc-400'
                }`}
              >
                <option value="question">Question</option>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
                <option value="feedback">General Feedback</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400'
                }`}
                placeholder="What is this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors resize-none ${
                  isDark
                    ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400'
                }`}
                placeholder="Tell us more..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? isDark
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : isDark
                    ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`py-8 px-5 border-t ${
          isDark ? 'border-zinc-800' : 'border-zinc-100'
        }`}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className={`text-xs ${
              isDark ? 'text-zinc-700' : 'text-zinc-400'
            }`}
          >
            &copy; {new Date().getFullYear()} Flink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HelpSupportPage;
