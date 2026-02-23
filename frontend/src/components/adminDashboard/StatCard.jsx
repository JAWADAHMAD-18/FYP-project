import { motion } from "framer-motion";

const StatCard = ({
  icon: Icon,
  label,
  children,
  iconColor = "text-teal-600",
  iconBg = "bg-teal-50",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                 hover:shadow-md transition-shadow duration-300 cursor-default"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div>{children}</div>
    </motion.div>
  );
};

export default StatCard;
