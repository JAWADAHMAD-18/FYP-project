import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";


export default function SavingsToast({ savings, onClose }) {
  const timerRef = useRef(null);

  // Auto-close after 3 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [onClose]);

  const formattedSavings = Number(savings || 0).toLocaleString("en-PK");

  return (
    <AnimatePresence>
      <motion.div
        key="savings-toast"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          top: "80px",
          right: "24px",
          zIndex: 9999,
          maxWidth: "380px",
          width: "calc(100vw - 48px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 15px -3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0, marginTop: "1px" }}>
            <CheckCircle2 size={22} color="#16a34a" />
          </div>

          {/* Message */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 700,
                color: "#14532d",
                lineHeight: "1.4",
              }}
            >
              🎉 Loyalty Cashback Earned!
            </p>
            <p
              style={{
                margin: "3px 0 0 0",
                fontSize: "13px",
                fontWeight: 500,
                color: "#166534",
                lineHeight: "1.5",
              }}
            >
              You received{" "}
              <span style={{ fontWeight: 800 }}>{formattedSavings} PKR</span> as
              loyalty cashback!
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#4ade80",
              padding: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#dcfce7";
              e.currentTarget.style.color = "#15803d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#4ade80";
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 3, ease: "linear" }}
          style={{
            height: "3px",
            background: "#22c55e",
            borderRadius: "0 0 6px 6px",
            transformOrigin: "left center",
            marginTop: "-1px",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
