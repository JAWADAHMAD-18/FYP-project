import { memo } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import TimelineItem from "../../components/adminDashboard/TimelineItem";

const RecentActivityTimeline = ({ recentActivity }) => {
  if (!recentActivity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-violet-50">
          <Activity size={18} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Recent Activity
          </h3>
          <p className="text-xs text-gray-400">Latest bookings</p>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[320px] pr-1 -mr-1 custom-scrollbar">
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No recent activity
          </p>
        ) : (
          recentActivity.map((booking, index) => (
            <TimelineItem
              key={booking.bookingCode}
              booking={booking}
              index={index}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default memo(RecentActivityTimeline);
