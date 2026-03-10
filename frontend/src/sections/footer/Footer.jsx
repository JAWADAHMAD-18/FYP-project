import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1A44] text-white pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          {/* 1. Brand & About */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter">
              TRIP<span className="text-blue-500">FUSION</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Making your travel dreams a reality with hand-picked destinations
              and personalized service. From the peaks of Hunza to the beaches
              of Bali.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Explore</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Famous Packages
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Domestic Tours
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  International Trips
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Travel Blog
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Support & Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Information</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Contact Details */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-blue-500" />
                <span>Office 12, Model Town A, Bahawalpur, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-blue-500" />
                <span>+92 303 7741461</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500" />
                <span>info@tripFusion.com</span>
              </li>
            </ul>

            {/* WhatsApp Direct Action */}
            <a
              href="https://wa.me/923037741461"
              className="mt-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              <FaWhatsapp className="text-xl" />
              Book via WhatsApp
            </a>
          </div>
        </div>

        <hr className="border-white/10 mb-5" />

        {/* Bottom Bar */}
        <div className="flex flex-col  justify-between items-center">
          <p className="text-gray-300 text-md text-center md:text-left">
            © {currentYear} TripFusion Agency. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
