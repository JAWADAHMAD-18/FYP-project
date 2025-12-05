import React from "react";

export default function Btn({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-block text-[#0A1A44] hover:text-[#2563EB] transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
