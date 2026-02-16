import { useNavigate } from "react-router-dom";

/**
 * A reusable Booking button that navigates to the booking page.
 *
 * @param {Object} props
 * @param {string} props.packageId - The ID of the package to book
 * @param {string} [props.className] - Additional classes
 */
export default function BookingButton({ packageId, className = "" }) {
  const navigate = useNavigate();

  const handleBook = () => {
    if (!packageId) return;
    navigate(`/booking/${packageId}`);
  };

  return (
    <button
      onClick={handleBook}
      className={`
        inline-flex items-center justify-center px-6 py-3
        bg-[#0A1A44] text-white font-bold text-sm
        rounded-xl shadow-md hover:shadow-lg
        hover:bg-[#0D9488] active:scale-[0.98]
        transition-all duration-200
        w-full sm:w-auto
        ${className}
      `}
    >
      Book This Package
    </button>
  );
}
