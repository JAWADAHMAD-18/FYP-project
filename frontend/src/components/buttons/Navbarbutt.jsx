import React from "react";
import { Link } from "react-router-dom";

export default function Btn({ children, to, className = "", ...props }) {
  // If "to" prop is provided, render a Link; otherwise render a button
  if (to) {
    return (
      <Link
        to={to}
        className={`inline-block text-[#0A1A44] hover:text-blue-600 transition ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={`inline-block text-[#0A1A44] hover:text-blue-600 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
