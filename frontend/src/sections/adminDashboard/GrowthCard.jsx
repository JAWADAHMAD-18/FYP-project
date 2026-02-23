import { memo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "../../components/adminDashboard/AnimatedCounter";

const GrowthCard = ({ growth }) => {
  if (!growth) return null;

  const { growthPercentage, currentMonthBookings, previousMonthBookings } =
    growth;

  const isPositive = growthPercentage > 0;
  const isNeutral = growthPercentage === 0;
  const isNegative = growthPercentage < 0;

  const GrowthIcon = isPositive
    ? TrendingUp
    : isNegative
      ? TrendingDown
      : Minus;

  const growthColor = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-red-500"
      : "text-gray-400";

  const growthBg = isPositive
    ? "bg-emerald-50"
    : isNegative
      ? "bg-red-50"
      : "bg-gray-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                 hover:shadow-md transition-shadow duration-300 cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Monthly Growth
        </span>
        <div className={`p-2 rounded-xl ${growthBg}`}>
          <GrowthIcon size={20} className={growthColor} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${growthColor}`}>
          {isPositive && "+"}
          <AnimatedCounter value={Math.abs(growthPercentage)} />%
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span>
          This month:{" "}
          <span className="font-semibold text-gray-600">
            {currentMonthBookings}
          </span>
        </span>
        <span>
          Last month:{" "}
          <span className="font-semibold text-gray-600">
            {previousMonthBookings}
          </span>
        </span>
      </div>
    </motion.div>
  );
};

export default memo(GrowthCard);
