import { memo, useEffect, useCallback, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

const CancelBookingModal = ({
  isOpen,
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  const [cancelReason, setCancelReason] = useState("");

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !isSubmitting) onCancel();
    },
    [onCancel, isSubmitting]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setCancelReason("");
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleConfirm = () => {
    onConfirm(cancelReason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isSubmitting ? onCancel : undefined}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Cancel Booking
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
          Please provide a reason for cancelling this booking.
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g. Customer request"
          rows={3}
          disabled={isSubmitting}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 disabled:bg-gray-50"
        />
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Cancelling…
              </>
            ) : (
              "Cancel Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CancelBookingModal);
