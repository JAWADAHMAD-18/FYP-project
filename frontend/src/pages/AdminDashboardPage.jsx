import { lazy, Suspense } from "react";
import { useAuth } from "../context/useAuth.js";
import useAdminDashboard from "../customHook/useAdminDashboard";
import TripFusionLoader from "../components/Loader/TripFusionLoader";
import { motion } from "framer-motion";
import { RefreshCw, LayoutDashboard } from "lucide-react";

// Lazy-load heavy sections
const RevenueCards = lazy(() => import("../sections/adminDashboardRevenueCards"));
const BookingStatsCards = lazy(() => import("../sections/adminDashboard/BookingStatsCards"));
const GrowthCard = lazy(() => import("../sections/adminDashboard/GrowthCard"));
const RevenueChart = lazy(() => import("../sections/adminDashboard/RevenueChart"));
const RecentActivityTimeline = lazy(() => import("../sections/adminDashboard/RecentActivityTimeline"));

const SectionFallback = () => (
  <div className="animate-pulse bg-gray-100 rounded-2xl h-40" />
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAdminDashboard();

  if (loading) {
    return <TripFusionLoader message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 ">
        <div className="bg-red-50 text-red-600 rounded-2xl px-8 py-6 text-center max-w-md">
          <p className="font-semibold text-lg mb-2">Something went wrong</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium
                       hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const now = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50">
              <LayoutDashboard size={22} className="text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{now}</p>
            </div>
          </div>

          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                       rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-200 shadow-sm self-start sm:self-auto"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </motion.div>

        {/* Stats Cards Grid */}
        <Suspense fallback={<SectionFallback />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <RevenueCards revenue={data?.revenue} />
            <GrowthCard growth={data?.growth} />
            <BookingStatsCards bookings={data?.bookings} />
          </div>
        </Suspense>

        {/* Chart + Timeline two-column layout */}
        <Suspense fallback={<SectionFallback />}>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-7">
              <RevenueChart revenueChart={data?.revenueChart} />
            </div>
            <div className="lg:col-span-3">
              <RecentActivityTimeline recentActivity={data?.recentActivity} />
            </div>
          </div>
        </Suspense>

        {/* Footer metadata */}
        {data?.generatedAt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-gray-300 text-center mt-8"
          >
            Data generated at{" "}
            {new Date(data.generatedAt).toLocaleString("en-PK", {
              timeZone: "Asia/Karachi",
            })}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
