import { useState } from "react";
import { useAuth } from "../../../context/useAuth.js";
import Btn from "../../buttons/Navbarbutt.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.isAdmin === true;

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
            {isAdmin ? (
              <>
                <Btn
                  to="/admin/dashboard"
                  data-aos="fade-down"
                  data-aos-duration="600"
                  data-aos-easing="linear"
                >
                  Dashboard
                </Btn>
                <Btn
                  to="/packages"
                  data-aos="fade-down"
                  data-aos-duration="700"
                  data-aos-easing="linear"
                >
                  Packages
                </Btn>
                <Btn
                  to="/admin/package/add-package"
                  data-aos="fade-down"
                  data-aos-duration="800"
                  data-aos-easing="linear"
                >
                  Add Package
                </Btn>
              </>
            ) : (
              <>
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
                  Packages
                </Btn>
                <Btn
                  data-aos="fade-down"
                  data-aos-duration="800"
                  data-aos-easing="linear"
                >
                  Contact
                </Btn>
              </>
            )}
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
                onClick={() => setOpen((prev) => !prev)}
                className="md:hidden text-3xl text-[#0A1A44]"
                aria-label="Toggle menu"
              >
                {open ? "✕" : "☰"}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {user && open && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg border-t border-gray-100 z-30">
          <div className="flex flex-col px-6 py-4 gap-4 text-lg font-medium">
            {isAdmin ? (
              <>
                <Btn to="/admin/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Btn>
                <Btn to="/packages" onClick={() => setOpen(false)}>
                  Packages
                </Btn>
                <Btn to="/admin/package" onClick={() => setOpen(false)}>
                  Add Package
                </Btn>
              </>
            ) : (
              <>
                <Btn to="/dashboard" onClick={() => setOpen(false)}>
                  Home
                </Btn>
                <Btn to="/packages" onClick={() => setOpen(false)}>
                  Packages
                </Btn>
                <Btn onClick={() => setOpen(false)}>Contact</Btn>
              </>
            )}

            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="text-left text-red-600 font-semibold text-lg mt-2 pt-3 border-t border-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
