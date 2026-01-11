import React from "react";
import { Sparkles, Package, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth.js";

const DashboardHeader = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="bg-[#0A1A44] rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="h-6 w-48 bg-white/20 rounded mb-3 animate-pulse" />
          <div className="h-4 w-72 bg-white/10 rounded animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0A1A44] rounded-b-3xl py-40">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-blue-200 mt-1 max-w-xl">
            Build custom trips with AI, explore company packages, or chat with
            our travel experts.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-[#0A1A44] font-semibold px-5 py-3 rounded-xl transition">
            <Sparkles size={18} />
            Create Trip with AI
          </button>

          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl transition">
            <Package size={18} />
            Browse Packages
          </button>

          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl transition">
            <MessageCircle size={18} />
            Chat with Expert
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
