import React, { useState, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

const ProfileSetupForm = ({ onComplete, onBack, initialData = {} }) => {
  const { isDark } = useTheme();
  const { supabase } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    handle: initialData.handle || "",
    bio: initialData.bio || "",
    location: initialData.location || "",
    website: initialData.website || "",
    profile_url: initialData.profile_url || "",
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialData.profile_url || "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.handle.trim()) {
      newErrors.handle = "Handle is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.handle)) {
      newErrors.handle =
        "Handle can only contain letters, numbers, underscores, and hyphens";
    } else if (formData.handle.length < 3) {
      newErrors.handle = "Handle must be at least 3 characters long";
    } else if (formData.handle.length > 30) {
      newErrors.handle = "Handle must be less than 30 characters";
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = "Bio must be less than 160 characters";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Image upload functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profile_pic: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profile_pic: 'Image size must be less than 5MB'
        }));
        return;
      }

      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        profile_pic: ''
      }));

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload image
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);

      // Update form data with the new URL
      setFormData(prev => ({
        ...prev,
        profile_url: publicUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        profile_pic: 'Failed to upload image. Please try again.'
      }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      profile_url: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onComplete({
        handle: formData.handle.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        website: formData.website.trim(),
        profile_url: formData.profile_url,
      });
    }
  };

  return (
    <div
      className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-2xl w-full mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Step 2 of 2
            </span>
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Profile Setup
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full ${
              isDark ? "bg-slate-700" : "bg-gray-200"
            }`}
          >
            <div className="h-2 bg-primary-600 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className={`rounded-2xl p-8 shadow-soft-lg ${
            isDark
              ? "bg-slate-800/50 border border-slate-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 brand-font">
              Complete Your Profile
            </h1>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Set up your Flink handle and tell people about yourself
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Handle */}
            <div>
              <label
                htmlFor="handle"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Flink Handle *
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <span className="text-sm">flink.to/</span>
                </div>
                <input
                  type="text"
                  id="handle"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  className={`w-full pl-20 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                    errors.handle
                      ? isDark
                        ? "bg-slate-700/50 border border-red-500 text-white placeholder-gray-400"
                        : "bg-gray-50 border border-red-500 text-gray-900 placeholder-gray-400"
                      : isDark
                      ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                      : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                  }`}
                  placeholder="your-handle"
                />
              </div>
              {errors.handle && (
                <p className="mt-2 text-sm text-red-500">{errors.handle}</p>
              )}
              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                This will be your unique Flink URL: flink.to/
                {formData.handle || "your-handle"}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                  errors.bio
                    ? isDark
                      ? "bg-slate-700/50 border border-red-500 text-white placeholder-gray-400"
                      : "bg-gray-50 border border-red-500 text-gray-900 placeholder-gray-400"
                    : isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="Tell people about yourself..."
              />
              {errors.bio && (
                <p className="mt-2 text-sm text-red-500">{errors.bio}</p>
              )}
              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formData.bio.length}/160 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 ${
                  errors.website
                    ? isDark
                      ? "bg-slate-700/50 border border-red-500 text-white placeholder-gray-400"
                      : "bg-gray-50 border border-red-500 text-gray-900 placeholder-gray-400"
                    : isDark
                    ? "bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:border-primary-500"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                }`}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="mt-2 text-sm text-red-500">{errors.website}</p>
              )}
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Profile Picture
              </label>
              
              {/* Image Preview */}
              {previewUrl && (
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    uploading
                      ? isDark
                        ? "border-gray-600 bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : errors.profile_pic
                      ? isDark
                        ? "border-red-500 bg-slate-700/50 text-red-400 hover:border-red-400"
                        : "border-red-500 bg-gray-50 text-red-400 hover:border-red-400"
                      : isDark
                      ? "border-slate-600 bg-slate-700/50 text-gray-300 hover:border-primary-500 hover:bg-slate-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:border-primary-500 hover:bg-gray-100"
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Uploading...
                    </div>
                  ) : previewUrl ? (
                    "Change Photo"
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Profile Photo
                    </div>
                  )}
                </button>
                
                {errors.profile_pic && (
                  <p className="mt-2 text-sm text-red-500">{errors.profile_pic}</p>
                )}
                
                <p className={`mt-2 text-xs text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  JPG, PNG, or GIF. Max 5MB.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={onBack}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
              >
                Complete Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupForm;
