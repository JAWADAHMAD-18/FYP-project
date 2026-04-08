import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/inputs/SignupInputs.jsx";
import { forgotPasswordApi } from "../services/auth.service.js";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSubmitting(true);
      await forgotPasswordApi(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              Forgot Your <br /> Password?
            </h2>
            <p className="mt-4 text-blue-100/80 text-sm max-w-xs">
              No worries — we'll send you a reset link to get back on track.
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
                Check Your Email
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                If an account with that email exists, we've sent a password
                reset link. Please check your inbox and spam folder.
              </p>
              <p className="text-gray-400 text-xs mt-4">
                The link will expire in 15 minutes.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-8 text-blue-600 font-bold text-sm hover:underline"
              >
                ← Back to Login
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-[#0A1A44]">
                  Reset Password
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-widest">
                  Enter your email address
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <p className="text-red-500 text-sm font-medium text-center">
                    {error}
                  </p>
                )}

                <InputField
                  label="Email Address"
                  name="email"
                  icon={Mail}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0A1A44] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-60"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;
