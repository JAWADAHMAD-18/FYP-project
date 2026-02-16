/**
 * Simple Toast Notification Utility
 * Appends a fixed-position div to document.body and removes it after delay.
 */

export const showToast = (message, type = "error") => {
  // Prevent duplicate toasts if one is already showing (optional, but good for spam prevention)
  const existingToast = document.getElementById("toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "toast-notification";
  toast.role = "alert";

  // Base styles
  const baseStyles =
    "fixed bottom-5 right-5 px-4 py-2 rounded-md shadow-lg text-white text-sm font-medium z-50 transition-opacity duration-300 opacity-0 translate-y-2 transform";

  // Type variants
  const bgClass = type === "success" ? "bg-green-600" : "bg-red-600";

  toast.className = `${baseStyles} ${bgClass}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  // Trigger animation in
  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");

    // Remove from DOM after transition
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};
