import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SocialHandlesForm from './SocialHandlesForm';
import ProfileSetupForm from './ProfileSetupForm';

const OnboardingFlow = ({ onComplete, user, userDetails }) => {
  const { supabase } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    socialLinks: {},
    profile: {},
    userId: user?.id,
    userName: userDetails?.name || user?.email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialHandlesNext = (data) => {
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
          handle: data.handle,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        throw profileError;
      }

      // Add social links to social_links table
      if (Object.keys(formData.socialLinks).length > 0) {
        const socialLinksData = Object.entries(formData.socialLinks).map(([platform, url]) => ({
          user_id: formData.userId,
          platform,
          url,
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
          profile_url: formData.profile.profile_url || null
        })
        .eq('id', formData.userId);

      if (userUpdateError) {
        throw userUpdateError;
      }

      console.log('Onboarding completed successfully');
      onComplete();
      
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip onboarding and just update first_login status
    setLoading(true);
    setError('');

    supabase
      .from('users')
      .update({ first_login: false })
      .eq('id', formData.userId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating first_login status:', error);
          setError('Failed to skip setup. Please try again.');
        } else {
          console.log('Onboarding skipped successfully');
          onComplete();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
          userEmail={user?.email}
        />
      )}

      {currentStep === 2 && (
        <ProfileSetupForm
          onComplete={handleProfileSetupComplete}
          onBack={handleBack}
          initialData={formData.profile}
        />
      )}

      {/* Skip button - only show on first step */}
      {currentStep === 1 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
