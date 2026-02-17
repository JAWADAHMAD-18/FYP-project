import { useState } from "react";
import { useAuth } from "../../../context/useAuth.js";
import Btn from "../../buttons/Navbarbutt.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full h-20 z-20 bg-white/40 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center px-6 md:px-12 h-full">
        {/* BRAND */}
        <h1
          data-aos="fade-down"
          data-aos-duration="600"
          className="text-3xl font-bold tracking-wide text-[#0A1A44]"
        >
          TripFusion
        </h1>

        {/* CENTER MENU (Desktop) */}
        {user && (
          <div className="hidden md:flex gap-8 text-lg font-medium">
            <Btn
              to="/dashboard"
              data-aos="fade-down"
              data-aos-duration="600"
              data-aos-easing="linear"
            >
              Home
            </Btn>
            <Btn
              to="/packages"
              data-aos="fade-down"
              data-aos-duration="700"
              data-aos-easing="linear"
            >
              packages
            </Btn>
            <Btn
              data-aos="fade-down"
              data-aos-duration="800"
              data-aos-easing="linear"
            >
              Contact
            </Btn>
          </div>
        )}

        {/* RIGHT MENU */}
        <div className="flex items-center gap-6">
          {/* Guest */}
          {!user && (
            <div className="flex items-center gap-6 ml-auto text-lg font-medium">
              <Btn
                to="/signup"
                data-aos="fade-down"
                data-aos-duration="600"
                data-aos-easing="linear"
              >
                SignUp
              </Btn>
              <Btn
                to="/login"
                data-aos="fade-down"
                data-aos-duration="700"
                data-aos-easing="linear"
              >
                Login
              </Btn>
            </div>
          )}

          {/* Logged-in Desktop */}
          {user && (
            <>
              <button
                data-aos="fade-down"
                data-aos-duration="800"
                data-aos-easing="linear"
                onClick={logout}
                className="hidden md:block text-[#0A1A44] hover:text-red-500 text-lg font-medium"
              >
                Logout
              </button>

              {/* Hamburger */}
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
          <>
            {/* Overlay */}
            {open && (
              <div
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              />
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 right-0 h-full bg-white shadow-xl w-[75%] max-w-sm
      transform transition-transform duration-300 z-40
      pt-24 px-6 flex flex-col gap-6 text-lg font-medium
      ${open ? "translate-x-0" : "translate-x-full"}`}
            >
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 text-3xl text-[#0A1A44]"
              >
                ✕
              </button>

              <Btn to="/dashboard" onClick={() => setOpen(false)}>
                Home
              </Btn>

              <Btn to="/packages" onClick={() => setOpen(false)}>
                Packages
              </Btn>

              <Btn onClick={() => setOpen(false)}>Contact</Btn>

              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="mt-auto text-red-600 font-semibold text-lg"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}
