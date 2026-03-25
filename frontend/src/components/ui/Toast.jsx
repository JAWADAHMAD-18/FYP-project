import { memo, useEffect } from "react";
import { useToast } from "../../context/ToastContext";

const AUTO_DISMISS_MS = 3000;

// Icon map per type
const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
    </svg>
  ),
};

const TYPE_STYLES = {
  success: "bg-teal-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-[#0A1A44] text-white",
};

function ToastItem({ id, message, type }) {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs w-full ${TYPE_STYLES[type] ?? TYPE_STYLES.info}`}
      style={{ animation: "toastIn 0.22s ease-out" }}
    >
      {ICONS[type] ?? ICONS.info}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => removeToast(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition ml-1"
        aria-label="Close notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Global container – rendered once in App.jsx
function ToastContainer() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}

export { ToastContainer };
export default memo(ToastContainer);
