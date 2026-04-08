import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/inputs/SignupInputs.jsx";
import { resetPasswordApi } from "../services/auth.service.js";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token")
  );
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If no token in URL → redirect to forgot-password immediately
  useEffect(() => {
    if (!token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.newPassword || !form.confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPasswordApi(token, form.newPassword);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired reset link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f0f4f8] p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-5xl h-full max-h-[600px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white md:text-[#0A1A44] font-bold text-sm bg-black/10 md:bg-transparent hover:md:bg-gray-400 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Home</span>
        </motion.button>

        {/* Left Visual */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-end text-white"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(10, 26, 68, 0.9), rgba(10, 26, 68, 0.2)), url('/stories_images/morning.avif')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="z-10 mb-6">
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Set Your <br /> New Password.
            </h2>
            <p className="mt-4 text-blue-100/80 text-sm max-w-xs">
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-[#0A1A44] mb-3">
                Password Reset!
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                Your password has been successfully reset. Redirecting you to
                login...
              </p>
              <div className="mt-6">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </motion.div>
          ) : error && !form.newPassword && !form.confirmPassword ? (
            // Error state with expired/invalid token — show go-back button
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-[#0A1A44] mb-3">
                Link Expired
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/forgot-password")}
                className="mt-8 bg-[#0A1A44] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-xl"
              >
                Request New Link
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-[#0A1A44]">
                  New Password
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-widest">
                  Create a strong password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <p className="text-red-500 text-sm font-medium text-center">
                    {error}
                  </p>
                )}

                <InputField
                  label="New Password"
                  name="newPassword"
                  icon={Lock}
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  isPassword
                />

                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  icon={ShieldCheck}
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  isPassword
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0A1A44] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-60"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {submitting ? "Resetting..." : "Reset Password"}
                </motion.button>
              </form>

              <p className="text-center text-gray-500 mt-10 text-sm">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign in
                </a>
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
