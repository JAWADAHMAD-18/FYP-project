import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  ArrowLeft,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { useToast } from "../../context/ToastContext.jsx";
import api from "../../api/Api.js";

//reusable input component
function SettingsInput({
  id,
  label,
  icon: Icon,
  disabled = false,
  hint,
  ...rest
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest"
      >
        {Icon && <Icon size={13} className="text-teal-500" />}
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          disabled={disabled}
          className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none
            ${
              disabled
                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 hover:border-gray-300"
            }`}
          {...rest}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

// main component
const ProfileSettingsSection = () => {
  const navigate = useNavigate();
  const { user, accessToken, applyAuth } = useAuth();
  const { addToast } = useToast();
//reusable input component
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
//reusable input component
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic ?? null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  /* ---------- submission state ---------- */
  const [submitting, setSubmitting] = useState(false);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept images only
    if (!file.type.startsWith("image/")) {
      addToast("Please select a valid image file.", "error");
      return;
    }
    // Max 5 MB guard on frontend
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image must be smaller than 5 MB.", "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // --- client-side validation ---
      const trimmedName = name.trim();
      if (trimmedName.length < 3) {
        addToast("Name must be at least 3 characters.", "error");
        return;
      }

      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
        if (!phoneRegex.test(trimmedPhone)) {
          addToast("Please enter a valid phone number.", "error");
          return;
        }
      }

      // --- build partial FormData (only changed fields) ---
      const formData = new FormData();

      let hasChanges = false;

      if (trimmedName !== (user?.name ?? "")) {
        formData.append("name", trimmedName);
        hasChanges = true;
      }
      if (trimmedPhone !== (user?.phone ?? "")) {
        formData.append("phone", trimmedPhone);
        hasChanges = true;
      }
      if (imageFile) {
        formData.append("profilePic", imageFile);
        hasChanges = true;
      }

      if (!hasChanges) {
        addToast("No changes detected.", "info");
        return;
      }

      try {
        setSubmitting(true);

        await api.patch("/user/profile-update", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Silently refresh user data in AuthContext — no flicker
        await applyAuth(accessToken);

        addToast("Profile updated successfully!", "success");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const msg =
          err?.response?.data?.message ?? "Something went wrong. Please try again.";
        addToast(msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [name, phone, imageFile, user, accessToken, applyAuth, addToast, navigate]
  );

  // Render component
  return (
    <section className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">

        {/* ---- Back navigation ---- */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </motion.button>

        {/* ---- Card ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Card header stripe */}
          <div
            className="h-28 w-full"
            style={{
              background:
                "linear-gradient(135deg, #0A1A44 0%, #0d2b72 50%, #0e7490 100%)",
            }}
          />

          {/* Avatar area */}
          <div className="px-8 pb-8">
            <div className="relative -mt-14 mb-6 flex items-end gap-4">
              {/* Profile picture with camera overlay */}
              <div className="relative group shrink-0">
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Change profile picture"
                >
                  <Camera size={20} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name + role */}
              <div className="mb-1">
                <h2 className="text-xl font-black text-gray-900 leading-tight">
                  {user?.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user?.isAdmin ? (
                    <>
                      <ShieldCheck size={13} className="text-teal-500" />
                      <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                        Administrator
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Explorer
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Helper note */}
            <p className="text-xs text-gray-400 mb-6 -mt-2 flex items-center gap-1.5">
              <Camera size={11} />
              Hover over your photo to change it
            </p>

            {/* ---- Form ---- */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <SettingsInput
                id="settings-name"
                label="Display Name"
                icon={User}
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <SettingsInput
                id="settings-email"
                label="Email Address"
                icon={Mail}
                type="email"
                value={user?.email ?? ""}
                disabled
                hint="Email address cannot be changed."
              />

              <SettingsInput
                id="settings-phone"
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="+1 234 567 8900 (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Divider */}
              <div className="border-t border-gray-100 pt-5">
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#0A1A44] hover:bg-[#0d2b72] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/15"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving changes…
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Bottom security note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your account information is encrypted and stored securely.
        </p>
      </div>
    </section>
  );
};

export default ProfileSettingsSection;
