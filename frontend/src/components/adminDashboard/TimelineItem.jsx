import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const STATUS_STYLES = {
  Confirmed: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },
  Pending: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  Cancelled: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
};

const TimelineItem = ({ booking, index }) => {
  const style = STATUS_STYLES[booking.bookingStatus] || STATUS_STYLES.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex gap-3 py-3 group"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={`w-2.5 h-2.5 rounded-full ${style.dot} ring-4 ring-white shadow-sm`}
        />
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {booking.packageTitle}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking.user?.name || "Unknown"} · {booking.destination}
            </p>
          </div>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${style.badge}`}
          >
            {booking.bookingStatus}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span className="font-medium text-gray-600">
            {booking.bookingCode}
          </span>
          <span>·</span>
          <span className="font-semibold text-gray-700">
            PKR {booking.totalPrice?.toLocaleString()}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatTimeAgo(booking.bookingDate)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;
