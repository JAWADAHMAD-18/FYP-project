import React, { useState } from "react";
import InputField from "../components/inputs/SignupInputs";
import { User, Mail, Lock, Plane } from "lucide-react";
  import API from "../api/Api.js"; // Axios instance


const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
    //   setLoading(true); // optional: show loading spinner on button
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      console.log("Payload to send:", payload);
      const response = await API.post("/user/register", payload);

      console.log("Signup successful:", response.data);

      // Optional: redirect to login or dashboard
      // navigate("/login");
      alert("Signup successful! Please login.");

      // Reset form
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      // Show user-friendly error
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
    //   setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">
          Ready for adventure?
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Let's get you traveling!
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-10 space-y-4"
        >
          <InputField
            label="Full Name"
            icon={User}
            placeholder="Your amazing name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Email Address"
            icon={Mail}
            placeholder="your@email.com"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
          />
          <InputField
            label="Password"
            icon={Lock}
            placeholder="Super secret password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            isPassword
          />
          <InputField
            label="Confirm Password"
            icon={Lock}
            placeholder="Type it again!"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            isPassword
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 mt-4 shadow-lg"
          >
            <Plane className="w-5 h-5" />
            Start My Journey!
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already exploring with us?{" "}
            <a
              href="/login"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Welcome back!
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
