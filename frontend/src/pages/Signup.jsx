import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Plane, ArrowLeft } from "lucide-react";
import InputField from "../components/inputs/SignupInputs";
import API from "../api/Api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";


const Signup = () => {
  const navigate = useNavigate();
  const { applyAuth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const res = await API.post("/user/register", payload, { withCredentials: true });
      const token = res.data?.data?.accessToken;
      if (!token) throw new Error("No access token returned from registration.");

      // Authenticate immediately — no need to visit /login
      const userData = await applyAuth(token);
      navigate(userData?.isAdmin ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f0f4f8] p-4 overflow-hidden">
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white w-full max-w-5xl h-full max-h-[730px] md:max-h-[650px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white md:text-[#0A1A44] font-bold text-sm bg-black/10 md:bg-transparent hover:md:bg-gray-400 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Home</span>
        </motion.button>
        {/* Left Side: Storytelling Image */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="hidden md:flex md:w-5/12 relative p-12 flex-col justify-between text-white"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 26, 68, 0.3), rgba(10, 26, 68, 0.8)), url('/stories_images/morning.avif')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="z-10">
            <h2 className="text-4xl font-black leading-tight tracking-tighter">
              Your Next Story <br /> Starts Here.
            </h2>
            <p className="mt-4 text-gray-100 text-md">
              Join a community of explorers seeking the extraordinary.
            </p>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <p className="text-sm font-light italic">
              "The best travel decision I ever made was clicking that sign up
              button."
            </p>
            <p className="text-xs mt-2 font-bold text-blue-300">— Sarah J.</p>
          </div>
        </motion.div>

        {/* Right Side: Compact Form */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full md:w-7/12 p-8 lg:p-14 flex flex-col justify-center"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-black text-[#0A1A44] tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Ready to explore the world with us?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2-Column Grid for Inputs to keep it compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <InputField
                label="Full Name"
                icon={User}
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <InputField
                label="Email Address"
                icon={Mail}
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                type="email"
              />
              <InputField
                label="Password"
                icon={Lock}
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                isPassword
              />
              <InputField
                label="Confirm Password"
                icon={Lock}
                placeholder="Confirm"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                isPassword
              />
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A1A44] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 mt-4 shadow-lg shadow-blue-900/10"
            >
              <Plane className={`w-5 h-5 rotate-45 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Creating your account..." : "Join the Journey"}
            </motion.button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Already a member?{" "}
            <a
              href="/login"
              className="text-blue-600 font-bold hover:text-blue-700"
            >
              Welcome back
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
