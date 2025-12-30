import React, { useState } from "react";
import InputField from "../components/inputs/SignupInputs.jsx";
import { Mail, Lock, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/Api.js"; // Axios instance

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!form.email || !form.password) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      console.log("Payload to send:", payload); // debug before sending

      const response = await API.post("/user/login", payload);

      console.log("Login successful:", response.data);

      alert("Login successful!");
      navigate("/"); // redirect to landing page

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Login to continue your adventure
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-10 space-y-4"
        >
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            isPassword
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 mt-4 shadow-lg"
          >
            <Plane className="w-5 h-5" />
            Login
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
