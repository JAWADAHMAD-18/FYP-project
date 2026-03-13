import { useState } from "react";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import RejectPaymentModal from "../../components/admin/RejectPaymentModal";
import CancelBookingModal from "../../components/admin/CancelBookingModal";

export default function AdminActionsSection({
  booking,
  onVerifyPayment,
  onRejectPayment,
  onCancelBooking,
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loading, setLoading] = useState({ verify: false, reject: false, cancel: false });

  const paymentStatus = booking?.payment_status ?? "pending_payment";
  const isPaid = booking?.paymentStatus === "Paid" || booking?.paymentProof?.verified;
  const isCancelled = booking?.bookingStatus === "Cancelled";
  const showPaymentActions =
    paymentStatus === "payment_submitted" && !isPaid && !isCancelled;
  const proofUrl =
    booking?.payment_proof_url ?? booking?.paymentProof?.imageUrl;

  const handleVerify = async () => {
    setLoading((l) => ({ ...l, verify: true }));
    try {
      await onVerifyPayment(booking._id);
    } finally {
      setLoading((l) => ({ ...l, verify: false }));
    }
  };

  const handleReject = async (reason) => {
    setLoading((l) => ({ ...l, reject: true }));
    try {
      await onRejectPayment(booking._id, reason);
      setRejectOpen(false);
    } finally {
      setLoading((l) => ({ ...l, reject: false }));
    }
  };

  const handleCancel = async (cancelReason) => {
    setLoading((l) => ({ ...l, cancel: true }));
    try {
      await onCancelBooking(booking._id, cancelReason);
      setCancelOpen(false);
    } finally {
      setLoading((l) => ({ ...l, cancel: false }));
    }
  };

  if (isCancelled) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-black text-[#0A1A44] mb-4">
          Admin Actions
        </h2>
        <p className="text-sm text-gray-500">
          This booking has been cancelled. No actions available.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-black text-[#0A1A44] mb-4">
          Admin Actions
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {showPaymentActions && proofUrl && (
            <>
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading.verify}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {loading.verify ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Approve Payment
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={loading.reject}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-60"
              >
                <XCircle size={18} />
                Reject Payment
              </button>
            </>
          )}

          {!isCancelled && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              disabled={loading.cancel}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition disabled:opacity-60"
            >
              <Ban size={18} />
              Cancel Booking
            </button>
          )}
        </div>

        {showPaymentActions && !proofUrl && (
          <p className="mt-3 text-sm text-amber-600">
            No payment proof uploaded yet. User must upload proof before approval.
          </p>
        )}
      </div>

      <RejectPaymentModal
        isOpen={rejectOpen}
        isSubmitting={loading.reject}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />

      <CancelBookingModal
        isOpen={cancelOpen}
        isSubmitting={loading.cancel}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </>
  );
}
