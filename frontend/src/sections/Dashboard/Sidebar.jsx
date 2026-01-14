import { motion } from "framer-motion";
import {
  Home,
  Compass,
  Heart,
  Briefcase,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "home", icon: Home, label: "Overview" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "trips", icon: Briefcase, label: "My Trips" },
    { id: "favorites", icon: Heart, label: "Saved" },
    { id: "insights", icon: BarChart3, label: "Insights" },
  ];

  return (
    <>
      {/* Desktop Sidebar Rail */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-6 top-24 bottom-6 w-20 hidden lg:flex flex-col items-center justify-between py-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 z-50"
      >
        <div className="flex flex-col gap-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative group p-3 rounded-2xl transition-all duration-300"
            >
              <item.icon
                size={24}
                className={`${
                  activeTab === item.id ? "text-teal-600" : "text-gray-400"
                } group-hover:text-teal-500 transition-colors`}
              />

              {/* Tooltip */}
              <span className="absolute left-20 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold whitespace-nowrap shadow-xl">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-r-full"
                />
              )}
            </button>
          ))}
        </div>

        <button className="p-3 text-gray-400 hover:text-red-500 transition-colors group">
          <LogOut size={24} />
          <span className="absolute left-20 bg-red-600 text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity font-bold">
            Logout
          </span>
        </button>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-2 rounded-xl ${
              activeTab === item.id ? "text-teal-600" : "text-gray-400"
            }`}
          >
            <item.icon size={24} />
          </button>
        ))}
        <button className="p-2 text-gray-400">
          <User size={24} />
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
