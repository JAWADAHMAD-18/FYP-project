import React, { useState } from "react";

const InputField = ({
  label,
  name,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  isPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-teal-600" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name} // ✅ important
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-4 bg-white border-b-2 border-gray-300 focus:border-teal-600 outline-none transition text-gray-800 text-lg rounded-md"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <span>🙈</span> : <span>👁️</span>}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
