import { useAuth } from "../../../context/AuthContext";
import Btn from "../../buttons/Navbarbutt";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
export default function Navbar() {
  const { user, logout } = useAuth();
  useGSAP(() => {
    gsap.from(".title", { y: -30, opacity: 0, duration: 0.6 });
    // const tl=gsap.timeline();
    gsap.from(".center-menu .btn", { y: -30, opacity: 0,stagger:0.3 });
    gsap.to(".center-menu .btn", { y: 0, opacity: 1, duration: 0.3,stagger:0.6 });
    gsap.from(".right-menu .btn", { y: -40, opacity: 0, duration: 0.3, stagger: 1 });
    gsap.to(".right-menu .btn", { y: 0, opacity: 1, duration: 0.3, stagger: 1 });

  });

  return (
    <div className="absolute top-0 left-0 w-full h-20 bg-white/40 backdrop-blur-sm">
      <nav className="relative z-10 flex justify-between items-center px-10 py-5 w-full">
        {/* BRAND */}
        <h1 className="title text-3xl font-bold tracking-wide text-[#0A1A44]">
          TripFusion
        </h1>

        {/* CENTER MENU (Only guests) */}
        {!user && (
          <div className="center-menu absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-lg font-medium">
            <Btn className="btn">Home</Btn>
            <Btn className="btn">About</Btn>
            <Btn className="btn">Contact</Btn>
          </div>
        )}

        {/* RIGHT MENU */}
        {!user && (
          <div className="right-menu flex items-center gap-8 text-lg font-medium">
            <Btn className="btn">Login</Btn>
            <Btn className="btn">Register</Btn>
          </div>
        )}

        {/* LOGOUT BUTTON */}
        {user && (
          <button
          
            onClick={logout}
            className="btn text-[#0A1A44] hover:text-red-500 transition text-lg font-medium"
          >
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}
