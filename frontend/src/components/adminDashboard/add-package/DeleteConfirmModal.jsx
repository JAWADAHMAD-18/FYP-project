import { memo, useEffect, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";


const DeleteConfirmModal = ({
  isOpen,
  isDeleting,
  packageTitle,
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !isDeleting) onCancel();
    },
    [onCancel, isDeleting],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8
                   animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>

        {/* Content */}
        <h3
          id="delete-modal-title"
          className="text-lg font-semibold text-gray-900 text-center"
        >
          Delete Package?
        </h3>
        <p
          id="delete-modal-desc"
          className="text-sm text-gray-500 text-center mt-2 leading-relaxed"
        >
          Are you sure you want to permanently delete{" "}
          <span className="font-medium text-gray-700">
            "{packageTitle || "this package"}"
          </span>
          ? This action cannot be undone and will fail if there are active
          bookings.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100
                       rounded-xl hover:bg-gray-200 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600
                       rounded-xl hover:bg-red-700 transition-colors duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(DeleteConfirmModal);
