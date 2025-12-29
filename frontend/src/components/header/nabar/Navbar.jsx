import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/useAuth.js";
import Btn from "../../buttons/Navbarbutt";
import gsap from "gsap";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const navRef = useRef(null);

  // Animate title on page load
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (navRef.current && navRef.current.querySelector(".title")) {
        gsap.from(".title", { y: -30, opacity: 0, duration: 0.6 });
      }
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-20 z-20 bg-white/40 backdrop-blur-md shadow-sm">
      <nav ref={navRef} className="flex justify-between items-center px-6 md:px-12 h-full">
        {/* BRAND */}
        <h1 className="title text-3xl font-bold tracking-wide text-[#0A1A44]">
          TripFusion
        </h1>

        {/* CENTER MENU — LOGGED-IN DESKTOP ONLY */}
        {user && (
          <div className="center-menu hidden md:flex gap-8 text-lg font-medium">
            <Btn className="btn">Home</Btn>
            <Btn className="btn">About</Btn>
            <Btn className="btn">Contact</Btn>
          </div>
        )}

        {/* RIGHT MENU */}
        <div className="flex items-center gap-6">
          {/* Guest */}
          {!user && (
            <div className="right-menu flex items-center gap-6 ml-auto text-lg font-medium">
              <Btn className="btn">Login</Btn>
              <Btn className="btn">Register</Btn>
            </div>
          )}

          {/* Logged-in Desktop */}
          {user && (
            <>
              <button
                onClick={logout}
                className="right-logout-btn hidden md:block text-[#0A1A44] hover:text-red-500 text-lg font-medium"
              >
                Logout
              </button>

              {/* Hamburger for mobile */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-3xl text-[#0A1A44]"
              >
                ☰
              </button>
            </>
          )}
        </div>

        {/* MOBILE SLIDE MENU */}
        {user && (
          <div
            ref={mobileMenuRef}
            className={`mobile-menu fixed top-0 right-0 h-full bg-white shadow-xl w-[40%] 
            transform transition-transform duration-300 pt-24 px-6 flex flex-col gap-6 text-lg font-medium
            ${open ? "translate-x-0" : "translate-x-full"}`}
          >
            <Btn className="btn">Home</Btn>
            <Btn className="btn">About</Btn>
            <Btn className="btn">Contact</Btn>

            <button
              onClick={logout}
              className="mt-auto text-red-600 font-semibold text-lg"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
