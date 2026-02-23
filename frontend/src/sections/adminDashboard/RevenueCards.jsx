import { memo } from "react";
import { DollarSign, CreditCard } from "lucide-react";
import StatCard from "../../components/adminDashboard/StatCard";
import AnimatedCounter from "../../components/adminDashboard/AnimatedCounter";

const formatPKR = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
};

const RevenueCards = ({ revenue }) => {
  if (!revenue) return null;

  return (
    <>
      <StatCard
        icon={DollarSign}
        label="Total Revenue"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        delay={0}
      >
        <p className="text-2xl font-bold text-gray-900">
          <span className="text-sm font-medium text-gray-400 mr-1">PKR</span>
          <AnimatedCounter value={revenue.totalRevenue} formatter={formatPKR} />
        </p>
      </StatCard>

      <StatCard
        icon={CreditCard}
        label="Paid Bookings"
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        delay={0.1}
      >
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={revenue.paidBookingsCount} />
        </p>
        <p className="text-xs text-gray-400 mt-1">Successfully paid</p>
      </StatCard>
    </>
  );
};

export default memo(RevenueCards);
