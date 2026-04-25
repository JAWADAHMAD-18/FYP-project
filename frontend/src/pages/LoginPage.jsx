import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Plane, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import InputField from "../components/inputs/SignupInputs.jsx";
import { useAuth } from "../context/useAuth.js";
import { googleAuthApi } from "../services/auth.service.js";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, applyAuth } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Guard: redirect already-logged-in users away from the login page
  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? "/admin/dashboard" : "/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const userData = await login({
        email: form.email.trim(),
        password: form.password,
      });

      // Use returned userData directly to avoid React state race condition
      
      if (userData?.isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    try {
      setError("");
      setGoogleSubmitting(true);
      const res = await googleAuthApi(idToken);
      const token = res?.data?.accessToken;
      if (!token) throw new Error("No access token returned");

      const userData = await applyAuth(token);
      if (userData?.isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row md:min-h-[600px]"
    >
      {/* Left Visual — desktop only */}
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
        {/* Back button — desktop */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white font-bold text-sm bg-black/20 hover:bg-black/30 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <div className="z-10 mb-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight">
            Welcome <br /> Back, Traveler.
          </h2>
          <p className="mt-4 text-blue-100/80 text-sm max-w-xs">
            Your next destination is just a login away.
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
        {/* Back button — mobile only */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="md:hidden flex items-center gap-2 text-[#0A1A44] font-bold text-sm mb-6 self-start"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#0A1A44]">Login</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-widest">
            Continue your adventure
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
            value={form.email}
            onChange={handleChange}
            required
            type="email"
          />

          <InputField
            label="Password"
            name="password"
            icon={Lock}
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            isPassword
          />

          <div className="text-right -mt-2">
            <a
              href="/forgot-password"
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0A1A44] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-60"
          >
            <Plane className="w-5 h-5" />
            {submitting ? "Signing in..." : "Sign In"}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
            {googleSubmitting ? (
              <button
                type="button"
                disabled
                className="w-full bg-[#0A1A44] text-white font-bold py-3 rounded-xl disabled:opacity-60"
              >
                Continue with Google...
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed")}
                text="continue_with"
                shape="pill"
                width="100%"
              />
            )}
          </div>
        </form>

        <p className="text-center text-gray-500 mt-10 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 font-bold hover:underline">
            Create one for free
          </a>
        </p>
      </motion.div>
    </motion.div>
  </div>
);
};

export default Login;
