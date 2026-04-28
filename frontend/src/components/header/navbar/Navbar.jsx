import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/useAuth.js";
import Btn from "../../buttons/Navbarbutt.jsx";
import { Headset } from "lucide-react";
import { useSupportChat } from "../../../features/supportChat/context/useSupportChat";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openChat, totalUnread, totalUnreadConversations } = useSupportChat();
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
        <div className="hidden md:flex gap-8 text-lg font-medium items-center">
          {user && (
            <>
              {isAdmin ? (
                <>
                  <Btn to="/admin/dashboard" data-aos="fade-down" data-aos-duration="700" data-aos-easing="linear">Dashboard</Btn>
                  <Btn to="/admin/bookings" data-aos="fade-down" data-aos-duration="750" data-aos-easing="linear">Bookings</Btn>
                  <Btn to="/packages" data-aos="fade-down" data-aos-duration="800" data-aos-easing="linear">Packages</Btn>
                  <Btn to="/admin/package/add-package" data-aos="fade-down" data-aos-duration="900" data-aos-easing="linear">Add Package</Btn>
                </>
              ) : (
                <>
                  <Btn to="/dashboard" data-aos="fade-down" data-aos-duration="700" data-aos-easing="linear">Home</Btn>
                  <Btn to="/packages" data-aos="fade-down" data-aos-duration="800" data-aos-easing="linear">Packages</Btn>
                  <Btn to="/about" data-aos="fade-down" data-aos-duration="900" data-aos-easing="linear">About</Btn>
                  <Btn to="/custom-package" data-aos="fade-down" data-aos-duration="1000" data-aos-easing="linear">Custom Package</Btn>
                </>
              )}
            </>
          )}

          {!user &&
            ["packages", "custom-package", "about"].map((path) => (
              <Btn
                key={path}
                to={`/${path}`}
                data-aos="fade-down"
                data-aos-duration="600"
                data-aos-easing="linear"
              >
                {path.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Btn>
            ))}
        </div>

        {/* RIGHT MENU */}
        <div className="flex items-center gap-6">
          {/* Admin support inbox (desktop) */}
          {user && isAdmin && (
            <button
              onClick={openChat}
              className="relative hidden md:inline-flex w-11 h-11 rounded-full bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition items-center justify-center text-teal-600"
              aria-label="Open support inbox"
            >
              <Headset className="w-5 h-5" />
              {(totalUnreadConversations ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-teal-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">
                  {(totalUnreadConversations ?? 0) > 99 ? "99+" : totalUnreadConversations}
                </span>
              )}
            </button>
          )}

          {/* Guest desktop links */}
          {!user && (
            <div className="hidden md:flex items-center gap-6 ml-auto text-lg font-medium">
              <Btn to="/signup" data-aos="fade-down" data-aos-duration="600" data-aos-easing="linear">SignUp</Btn>
              <Btn to="/login" data-aos="fade-down" data-aos-duration="700" data-aos-easing="linear">Login</Btn>
            </div>
          )}

          {/* Guest mobile hamburger */}
          {!user && (
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="md:hidden text-3xl text-[#0A1A44]"
              aria-label="Toggle menu"
            >
              {open ? "✕" : "☰"}
            </button>
          )}

          {/* Logged-in Desktop */}
          {user && (
            <>
              {/* Admin support inbox (mobile) */}
              {isAdmin && (
                <button
                  onClick={openChat}
                  className="relative md:hidden w-11 h-11 rounded-full bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition items-center justify-center text-teal-600 flex"
                  aria-label="Open support inbox"
                >
                  <Headset className="w-5 h-5" />
                  {(totalUnreadConversations ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-teal-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">
                      {(totalUnreadConversations ?? 0) > 99 ? "99+" : totalUnreadConversations}
                    </span>
                  )}
                </button>
              )}
              <button
                data-aos="fade-down"
                data-aos-duration="800"
                data-aos-easing="linear"
                onClick={logout}
                className="hidden md:block text-[#0A1A44] hover:text-blue-600 transition text-lg font-medium"
              >
                Logout
              </button>

              {/* Hamburger (logged-in) */}
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

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg border-t border-gray-100 z-30">
          <div className="flex flex-col px-6 py-4 gap-4 text-lg font-medium">
            <Btn to="/about" onClick={() => setOpen(false)}>About</Btn>
            <Btn to="/custom-package" onClick={() => setOpen(false)}>Custom Package</Btn>

            {user && (
              <>
                {isAdmin ? (
                  <>
                    <Btn to="/admin/dashboard" onClick={() => setOpen(false)}>Dashboard</Btn>
                    <Btn to="/admin/bookings" onClick={() => setOpen(false)}>Bookings</Btn>
                    <Btn to="/packages" onClick={() => setOpen(false)}>Packages</Btn>
                    <Btn to="/admin/package/add-package" onClick={() => setOpen(false)}>Add Package</Btn>
                  </>
                ) : (
                  <>
                    <Btn to="/dashboard" onClick={() => setOpen(false)}>Home</Btn>
                    <Btn to="/packages" onClick={() => setOpen(false)}>Packages</Btn>
                    <Btn onClick={() => setOpen(false)}>Contact</Btn>
                  </>
                )}
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="text-left text-red-600 font-semibold text-lg mt-2 pt-3 border-t border-gray-100"
                >
                  Logout
                </button>
              </>
            )}

            {!user && (
              <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-gray-100">
                <Btn to="/login" onClick={() => setOpen(false)}>Login</Btn>
                <Btn to="/signup" onClick={() => setOpen(false)}>Sign Up</Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}