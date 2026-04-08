import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Plane, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/inputs/SignupInputs.jsx";
import { useAuth } from "../context/useAuth.js";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Guard: redirect already-logged-in users away from the login page
  useEffect(() => {
    if (user) {
      console.log("[Login] Already authenticated. isAdmin:", user.isAdmin);
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
      console.log(
        "[Login] handleSubmit — userData.isAdmin:",
        userData?.isAdmin,
      );
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
          </form>

          <p className="text-center text-gray-500 mt-10 text-sm">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-bold hover:underline"
            >
              Create one for free
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
