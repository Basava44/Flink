import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SocialHandlesForm from './SocialHandlesForm';
import ProfileSetupForm from './ProfileSetupForm';

const OnboardingFlow = ({ onComplete, userName, userEmail, userId }) => {
  const { supabase } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    socialLinks: {},
    profile: {},
    userId,
    userName,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialHandlesNext = (data) => {
    setFormData(prev => ({ ...prev, socialLinks: data.socialLinks, customLinks: data.customLinks || [] }));
    setCurrentStep(2);
  };

  const handleProfileSetupComplete = async (data) => {
    setFormData(prev => ({ ...prev, profile: data }));
    setLoading(true);
    setError('');

    try {
      const { error: profileError } = await supabase
        .from('flink_profiles')
        .insert([{
          user_id: formData.userId,
          handle: data.handle.toLowerCase(),
          bio: data.bio || null,
          location: data.location || null,
          website: data.website || null,
          is_private: data.private || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      const nonEmptySocialLinks = Object.entries(formData.socialLinks).filter(
        ([, url]) => url && url.trim() !== ''
      );

      const socialLinksData = nonEmptySocialLinks.map(([platform, url]) => ({
        user_id: formData.userId,
        platform,
        url: url.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Add custom links
      if (formData.customLinks?.length > 0) {
        formData.customLinks.forEach((link, idx) => {
          socialLinksData.push({
            user_id: formData.userId,
            platform: 'custom',
            url: link.url.trim(),
            label: link.label.trim(),
            display_order: idx,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      // Delete any existing social links first (prevents duplicates on re-onboarding)
      await supabase
        .from('social_links')
        .delete()
        .eq('user_id', formData.userId);

      if (socialLinksData.length > 0) {
        const { error: socialLinksError } = await supabase
          .from('social_links')
          .insert(socialLinksData);

        if (socialLinksError) throw socialLinksError;
      }

      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          first_login: false,
          name: formData.userName,
          profile_url: data.profile_url || null
        })
        .eq('id', formData.userId);

      if (userUpdateError) throw userUpdateError;

      if (data.profile_url) {
        await supabase
          .from('flink_profiles')
          .update({ profile_url: data.profile_url })
          .eq('user_id', formData.userId);
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
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white mx-auto mb-4" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <SocialHandlesForm
          onNext={handleSocialHandlesNext}
          onBack={handleBack}
          initialData={formData.socialLinks}
          userEmail={userEmail}
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
  );
};

export default OnboardingFlow;
