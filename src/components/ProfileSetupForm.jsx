import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { Globe, Lock, Camera, X, User, MapPin, FileText, Check, Loader2 } from "lucide-react";

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
    private: initialData.private || false,
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialData.profile_url || "");
  const [handleStatus, setHandleStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const checkTimeout = useRef(null);

  // Debounced handle availability check
  const checkHandleAvailability = useCallback((handle) => {
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    if (!handle || handle.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(handle)) {
      setHandleStatus(null);
      return;
    }
    setHandleStatus('checking');
    checkTimeout.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('flink_profiles')
          .select('id')
          .eq('handle', handle.toLowerCase())
          .maybeSingle();
        setHandleStatus(data ? 'taken' : 'available');
      } catch {
        setHandleStatus(null);
      }
    }, 400);
  }, [supabase]);

  useEffect(() => {
    return () => { if (checkTimeout.current) clearTimeout(checkTimeout.current); };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "handle" ? value.toLowerCase().replace(/[^a-z0-9_-]/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "handle") checkHandleAvailability(newValue);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.handle.trim()) {
      newErrors.handle = "Handle is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.handle)) {
      newErrors.handle = "Only letters, numbers, underscores, hyphens";
    } else if (formData.handle.length < 3) {
      newErrors.handle = "At least 3 characters";
    } else if (formData.handle.length > 30) {
      newErrors.handle = "Max 30 characters";
    } else if (handleStatus === 'taken') {
      newErrors.handle = "Handle already taken";
    }
    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = "Max 160 characters";
    }
    if (formData.website && !formData.website.startsWith("http")) {
      newErrors.website = "Include https://";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, profile_pic: "Not a valid image" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profile_pic: "Max 5MB" }));
      return;
    }
    setErrors((prev) => ({ ...prev, profile_pic: "" }));
    setPreviewUrl(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, profile_url: publicUrl }));
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({ ...prev, profile_pic: "Upload failed" }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, profile_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        private: formData.private,
      });
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
    isDark
      ? "bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
      : "bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
  }`;

  const errorInputClass = isDark
    ? "border-red-800 focus:border-red-600 focus:ring-red-600"
    : "border-red-300 focus:border-red-400 focus:ring-red-400";

  const initial = formData.handle ? formData.handle.charAt(0).toUpperCase() : "?";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
      <div className="min-h-screen flex">
        {/* Left panel - live preview on lg+ */}
        <div className={`hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col items-center justify-center p-12 ${
          isDark ? "bg-zinc-900" : "bg-zinc-100"
        }`}>
          <div className="w-full max-w-xs">
            <p className={`text-xs font-medium uppercase tracking-wider mb-6 text-center ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              Live preview
            </p>

            {/* Mini profile card preview */}
            <div className={`rounded-2xl p-6 ${isDark ? "bg-zinc-800" : "bg-white shadow-sm"}`}>
              <div className="flex flex-col items-center text-center">
                {/* Avatar preview */}
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-4" />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${
                    isDark ? "bg-zinc-700 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {initial}
                  </div>
                )}

                {/* Handle */}
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  @{formData.handle || "your-handle"}
                </p>

                {/* Bio */}
                {formData.bio && (
                  <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    {formData.bio}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {formData.location && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      isDark ? "bg-zinc-700 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <MapPin className="w-3 h-3" /> {formData.location}
                    </span>
                  )}
                  {formData.website && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      isDark ? "bg-zinc-700 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <Globe className="w-3 h-3" /> Website
                    </span>
                  )}
                </div>

                {/* Privacy badge */}
                <div className={`mt-4 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                  formData.private
                    ? isDark ? "bg-orange-900/20 text-orange-400 border border-orange-800/30" : "bg-orange-50 text-orange-600 border border-orange-200"
                    : isDark ? "bg-green-900/20 text-green-400 border border-green-800/30" : "bg-green-50 text-green-600 border border-green-200"
                }`}>
                  {formData.private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {formData.private ? "Private" : "Public"}
                </div>
              </div>

              {/* Fake link items */}
              <div className="mt-6 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    isDark ? "bg-zinc-700/50" : "bg-zinc-50"
                  }`}>
                    <div className={`w-7 h-7 rounded-md ${isDark ? "bg-zinc-600" : "bg-zinc-200"}`} />
                    <div className={`h-2 rounded-full flex-1 ${isDark ? "bg-zinc-600" : "bg-zinc-200"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-start lg:items-center justify-center overflow-y-auto">
          <div className="w-full max-w-lg px-4 py-8 lg:px-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Step 2 of 2</span>
                <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Profile setup</span>
              </div>
              <div className={`w-full h-1 rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-full transition-all duration-300" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                Set up your profile
              </h1>
              <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Choose a handle and tell people about yourself.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile picture */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                        isDark
                          ? "bg-zinc-800 border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-600"
                          : "bg-zinc-100 border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 rounded-full animate-spin border-zinc-400 border-t-transparent" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {errors.profile_pic && <p className="text-center text-xs text-red-500">{errors.profile_pic}</p>}

              {/* Handle */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Handle *
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>@</span>
                  <input
                    type="text"
                    name="handle"
                    value={formData.handle}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-8 pr-10 ${errors.handle || handleStatus === 'taken' ? errorInputClass : handleStatus === 'available' ? (isDark ? "border-green-700 focus:border-green-600 focus:ring-green-600" : "border-green-400 focus:border-green-500 focus:ring-green-500") : ""}`}
                    placeholder="your-handle"
                  />
                  {formData.handle.length >= 3 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {handleStatus === 'checking' && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                      {handleStatus === 'available' && <Check className="w-4 h-4 text-green-500" />}
                      {handleStatus === 'taken' && <X className="w-4 h-4 text-red-500" />}
                    </span>
                  )}
                </div>
                {errors.handle ? (
                  <p className="mt-1 text-xs text-red-500">{errors.handle}</p>
                ) : handleStatus === 'taken' ? (
                  <p className="mt-1 text-xs text-red-500">This handle is already taken</p>
                ) : handleStatus === 'available' ? (
                  <p className="mt-1 text-xs text-green-500">Handle is available</p>
                ) : (
                  <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    flink.to/{formData.handle || "..."}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className={`${inputClass} resize-none ${errors.bio ? errorInputClass : ""}`}
                  placeholder="Tell people about yourself..."
                />
                <p className={`mt-1 text-xs ${formData.bio.length > 160 ? "text-red-500" : isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  {formData.bio.length}/160
                </p>
              </div>

              {/* Location & Website side by side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.website ? errorInputClass : ""}`}
                    placeholder="https://yoursite.com"
                  />
                  {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
                </div>
              </div>

              {/* Privacy toggle */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? "bg-zinc-800/50 border border-zinc-700" : "bg-zinc-50 border border-zinc-200"
              }`}>
                <div className="flex items-center gap-2">
                  {formData.private ? (
                    <Lock className={`w-4 h-4 ${isDark ? "text-orange-400" : "text-orange-500"}`} />
                  ) : (
                    <Globe className={`w-4 h-4 ${isDark ? "text-green-400" : "text-green-500"}`} />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>
                      {formData.private ? "Private" : "Public"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {formData.private ? "Only you can see your profile" : "Anyone can view your profile"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, private: !prev.private }))}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    formData.private
                      ? isDark ? "bg-orange-600" : "bg-orange-500"
                      : isDark ? "bg-green-600" : "bg-green-500"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.private ? "left-5.5 translate-x-0.5" : "left-0.5"
                  }`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? "border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  Complete setup
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupForm;
