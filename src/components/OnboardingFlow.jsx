import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SocialHandlesForm from './SocialHandlesForm';
import ProfileSetupForm from './ProfileSetupForm';

const OnboardingFlow = ({ onComplete, user, userDetails, userName, userEmail, userId }) => {
  const { supabase } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Debug logging
  console.log('OnboardingFlow render - currentStep:', currentStep);
  const [formData, setFormData] = useState({
    socialLinks: {},
    profile: {},
    userId: userId || user?.id,
    userName: userName || userDetails?.name || user?.email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialHandlesNext = (data) => {
    console.log('Moving to step 2 - Profile Setup');
    setFormData(prev => ({
      ...prev,
      socialLinks: data.socialLinks
    }));
    setCurrentStep(2);
  };

  const handleProfileSetupComplete = async (data) => {
    setFormData(prev => ({
      ...prev,
      profile: data
    }));
    
    setLoading(true);
    setError('');

    try {
      // Update user profile in flink_profiles table
      const { error: profileError } = await supabase
        .from('flink_profiles')
        .insert([{
          user_id: formData.userId, // This should be passed from parent
          handle: data.handle.toLowerCase(),
          bio: data.bio || null,
          location: data.location || null,
          website: data.website || null,
          private: data.private || false, // Default to public profile
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        throw profileError;
      }

      // Add social links to social_links table (only non-empty ones)
      const nonEmptySocialLinks = Object.entries(formData.socialLinks).filter(([, url]) => 
        url && url.trim() !== ''
      );
      
      console.log('Social links to save:', nonEmptySocialLinks);
      
      if (nonEmptySocialLinks.length > 0) {
        const socialLinksData = nonEmptySocialLinks.map(([platform, url]) => ({
          user_id: formData.userId,
          platform,
          url: url.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: socialLinksError } = await supabase
          .from('social_links')
          .insert(socialLinksData);

        if (socialLinksError) {
          throw socialLinksError;
        }
      }

      // Update user's first_login status to false and add profile info
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          first_login: false,
          name: formData.userName,
          profile_url: data.profile_url || null
        })
        .eq('id', formData.userId);

      if (userUpdateError) {
        throw userUpdateError;
      }

      // Update profile_url in flink_profiles table
      const { error: profileUrlError } = await supabase
        .from('flink_profiles')
        .update({
          profile_url: data.profile_url || null
        })
        .eq('user_id', formData.userId);

      if (profileUrlError) {
        throw profileUrlError;
      }
      onComplete();
      
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log('Going back from step', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  if (loading) {
    return (
      <div className="onboarding-loading min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Warning Message - Hidden on mobile */}
      <div className="onboarding-desktop hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mobile Only
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Onboarding is designed for mobile devices. Please access it from your phone or resize your browser window.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Mobile Onboarding - Visible only on mobile */}
      <div className="md:hidden">
        {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <SocialHandlesForm
          onNext={handleSocialHandlesNext}
          onBack={handleBack}
          initialData={formData.socialLinks}
          userEmail={userEmail || user?.email}
        />
      )}

      {currentStep === 2 && (
        <ProfileSetupForm
          onComplete={handleProfileSetupComplete}
          onBack={handleBack}
          initialData={formData.profile}
        />
      )}

      </div>
    </>
  );
};

export default OnboardingFlow;
