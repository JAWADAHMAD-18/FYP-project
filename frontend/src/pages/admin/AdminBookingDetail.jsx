import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import TripFusionLoader from "../../components/Loader/TripFusionLoader";
import BookingInfoSection from "../../sections/adminBookings/BookingInfoSection";
import PackageSnapshotSection from "../../sections/adminBookings/PackageSnapshotSection";
import PaymentProofSection from "../../sections/adminBookings/PaymentProofSection";
import AdminActionsSection from "../../sections/adminBookings/AdminActionsSection";
import {
  getBookingById,
  verifyPayment,
  rejectPayment,
  cancelBooking,
} from "../../services/admin/adminBooking.services";

export default function AdminBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingById(id);
      setBooking(data);
    } catch (e) {
      setError(
        e?.response?.data?.message ?? e?.message ?? "Failed to load booking"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleVerifyPayment = async (bookingId) => {
    await verifyPayment(bookingId);
    showToast("Payment approved successfully");
    fetchBooking();
  };

  const handleRejectPayment = async (bookingId, reason) => {
    await rejectPayment(bookingId, reason);
    showToast("Payment rejected");
    fetchBooking();
  };

  const handleCancelBooking = async (bookingId, cancelReason) => {
    await cancelBooking(bookingId, cancelReason);
    showToast("Booking cancelled");
    fetchBooking();
  };

  if (loading) return <TripFusionLoader message="Loading booking..." />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error ?? "Unknown error"}</p>
          <Link
            to="/admin/bookings"
            className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}

        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1A44] hover:text-teal-600 transition mb-6"
        >
          <ChevronLeft size={17} />
          Back to Bookings
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <BookingInfoSection booking={booking} />
          <PackageSnapshotSection booking={booking} />
          <PaymentProofSection booking={booking} />
          <AdminActionsSection
            booking={booking}
            onVerifyPayment={handleVerifyPayment}
            onRejectPayment={handleRejectPayment}
            onCancelBooking={handleCancelBooking}
          />
        </motion.div>
      </div>
    </div>
  );
}
