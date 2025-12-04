import React from "react";
import { useAuth } from '../../../context/AuthContext';
export default function Navbar() {
  const { fetchUser, logout } = useAuth();

  return (
    <div className="absolute top-0 left-0 w-full h-20 bg-white/40 backdrop-blur-sm">
      <nav className="relative z-10 flex justify-between items-center px-10 py-5 w-full">
        {/* LEFT TITLE */}
        <h1 className="text-3xl font-bold tracking-wide text-[#0A1A44]">
          TripFusion
        </h1>

        {/* CENTER MENU (Visible Only When User Logged In) */}
        {fetchUser.name && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-lg font-medium">
            <button className="text-[#0A1A44] hover:text-[#4A90E2] transition">
              Home
            </button>
            <button className="text-[#0A1A44] hover:text-[#4A90E2] transition">
              About
            </button>
            <button className="text-[#0A1A44] hover:text-[#4A90E2] transition">
              Contact
            </button>
          </div>
        )}

        {/* RIGHT MENU */}
        {!user && (
          <div className="flex items-center gap-8 text-lg font-medium">
            <button className="text-[#0A1A44] hover:text-[#4A90E2] transition">
              Login
            </button>
            <button className="text-[#0A1A44] hover:text-[#4A90E2] transition">
              Signup
            </button>
          </div>
        )}

        {/* SHOW LOGOUT WHEN USER LOGGED IN */}
        {fetchUser.name && (
          <button
            onClick={logout}
            className="text-[#0A1A44] hover:text-red-500 transition text-lg font-medium"
          >
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}
