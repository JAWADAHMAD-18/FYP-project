import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, PieChart, ArrowUpRight, Zap } from "lucide-react";
import { getTravelSummary } from "../../services/travel.service.js";

const TravelInsights = () => {
  const [summary, setSummary] = useState({
    totalSpent: 0,
    fusionSavings: 0,
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getTravelSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Fallback values if loading
  const { totalSpent, fusionSavings, categoryBreakdown } = summary;
  const accommodationsPercent =
    categoryBreakdown.find((c) => c.name === "accommodations")?.percentage || 0;
  const flightsPercent =
    categoryBreakdown.find((c) => c.name === "flights")?.percentage || 0;
  const experiencesPercent =
    categoryBreakdown.find((c) => c.name === "experiences")?.percentage || 0;

  return (
    <section className="px-6 md:px-12 py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Analytics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Financial Insights
                </h3>
                <p className="text-gray-500 font-medium">
                  Tracking your fusion efficiency.
                </p>
              </div>
              <div className="bg-teal-50 p-3 rounded-2xl">
                <PieChart className="text-teal-600" size={24} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Savings Meter */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-teal-500 border-t-transparent animate-spin-slow flex items-center justify-center">
                    <Zap
                      className="text-teal-500"
                      size={20}
                      fill="currentColor"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Fusion Savings
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      ${fusionSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  You’ve saved{" "}
                  <span className="text-teal-600 font-bold">
                    {Math.round((fusionSavings / (totalSpent || 1)) * 100)}%
                  </span>{" "}
                  this month by using multi-destination fusion logic.
                </p>
              </div>

              {/* Spend Categories */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Accommodations</span>
                    <span>{accommodationsPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${accommodationsPercent}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-teal-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Transport & Flights</span>
                    <span>{flightsPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${flightsPercent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Experiences</span>
                    <span>{experiencesPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${experiencesPercent}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-indigo-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Wallet Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <Wallet className="text-teal-400 mb-6" size={32} />
                <h4 className="text-gray-400 font-medium mb-1">
                  Total Travel Budget
                </h4>
                <p className="text-4xl font-bold tracking-tighter">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-tighter">
                    Market Update
                  </span>
                  <TrendingUp size={14} className="text-teal-400" />
                </div>
                <p className="text-sm font-medium">
                  Flights to Europe are 10% cheaper this week.
                </p>
                <button className="mt-3 flex items-center gap-1 text-xs font-black group">
                  VIEW DEALS{" "}
                  <ArrowUpRight
                    size={12}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TravelInsights;
