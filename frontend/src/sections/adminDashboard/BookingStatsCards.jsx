import { memo } from "react";
import { CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import StatCard from "../../components/adminDashboard/StatCard";
import AnimatedCounter from "../../components/adminDashboard/AnimatedCounter";

const BookingStatsCards = ({ bookings }) => {
  if (!bookings) return null;

  return (
    <>
      <StatCard
        icon={CalendarCheck}
        label="Total Bookings"
        iconColor="text-violet-600"
        iconBg="bg-violet-50"
        delay={0.2}
      >
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={bookings.total} />
        </p>
      </StatCard>

      <StatCard
        icon={Clock}
        label="Pending"
        iconColor="text-amber-600"
        iconBg="bg-amber-50"
        delay={0.25}
      >
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={bookings.pending} />
        </p>
        <p className="text-xs text-amber-500 mt-1">Awaiting payment</p>
      </StatCard>

      <StatCard
        icon={CheckCircle}
        label="Confirmed"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        delay={0.3}
      >
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={bookings.confirmed} />
        </p>
        <p className="text-xs text-emerald-500 mt-1">Active bookings</p>
      </StatCard>

      <StatCard
        icon={XCircle}
        label="Cancelled"
        iconColor="text-red-500"
        iconBg="bg-red-50"
        delay={0.35}
      >
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={bookings.cancelled} />
        </p>
      </StatCard>
    </>
  );
};

export default memo(BookingStatsCards);
