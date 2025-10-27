import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import BackgroundPattern from '../components/BackgroundPattern';
import emailjs from '@emailjs/browser';
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle,
  AlertCircle,
  Phone,
  Clock,
  FileText
} from 'lucide-react';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.email || '',
    email: user?.email || '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [userProfileHandle, setUserProfileHandle] = useState(null);

  // EmailJS Configuration
  const EMAILJS_SERVICE_ID = 'service_0x90k2w';
  const EMAILJS_TEMPLATE_ID = 'template_ta7xsho';
  const EMAILJS_PUBLIC_KEY = 'p7oUEROenZNCa6crO';
  const SUPPORT_EMAIL = 'karibasava.t.g@gmail.com';

  // Get user's profile handle for navigation
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare email parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        to_email: SUPPORT_EMAIL,
        subject: formData.subject,
        priority: formData.priority,
        message: formData.message,
        user_email: formData.email,
        // Combine subject and message for better visibility
        reply_to: formData.email,
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', response);
      
      // Show success message
      setSubmitStatus('success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: user?.user_metadata?.full_name || user?.email || '',
          email: user?.email || '',
          subject: '',
          message: '',
          priority: 'medium'
        });
        setSubmitStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Error submitting support request:', error);
      setSubmitStatus('error');
      alert('Failed to send email. Please try again later or contact us directly at ' + SUPPORT_EMAIL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative ${
      isDark ? "text-white" : "text-gray-900"
    }`}>
      <BackgroundPattern />
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${
        isDark 
          ? "bg-slate-800 border-slate-700" 
          : "bg-white border-gray-200"
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <HelpCircle className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`} />
              <h1 className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                Help & Support
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Support Form */}
        <div className={`p-6 rounded-2xl ${
          isDark 
            ? "bg-slate-800 border border-slate-700" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="text-center mb-8">
            <div className={`inline-flex p-4 rounded-full mb-4 ${
              isDark ? "bg-blue-500/20" : "bg-blue-100"
            }`}>
              <HelpCircle className={`w-8 h-8 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>
              Need Help?
            </h2>
            <p className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              Send us a message and we'll get back to you within 24 hours
            </p>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              isDark 
                ? "bg-green-900/20 border border-green-800 text-green-300" 
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                Your support request has been prepared! Your email client should open with the message ready to send.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              isDark 
                ? "bg-red-900/20 border border-red-800 text-red-300" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                There was an error preparing your support request. Please try again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                }`}
                placeholder="What do you need help with?"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                }`}
                placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer with Flink Branding */}
      <div className="mt-6 mb-2">
        <div className={`text-center ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}>
          <div className="text-xs opacity-60">
            Made with ❤️ by <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Flink</span>
          </div>
          <div className="text-xs opacity-50 mt-1">
            © 2025 Flink. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
