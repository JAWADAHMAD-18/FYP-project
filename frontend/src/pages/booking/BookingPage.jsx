import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Minus,
  Plus,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import { getPackageById } from "../../services/package.service.js";
import { createBooking } from "../../services/booking.service.js";
import TripFusionLoader from "../../components/Loader/TripFusionLoader.jsx";
import InfoBadge from "../../components/BookingPage/InfoBadge.jsx";
// ─── Helpers
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPrice(n) {
  return Number(n || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// ─── Main Component
export default function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // ── Package fetch state
  const [pkg, setPkg] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Booking form state
  const [numPeople, setNumPeople] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Duplicate-submission guard
  const isSubmittingRef = useRef(false);

  // ── Derived values
  const maxSlots = pkg?.available_slot ?? 1;
  const pricePerPerson = pkg?.price ?? 0;
  const totalPrice = useMemo(
    () => pricePerPerson * numPeople,
    [pricePerPerson, numPeople],
  );

  // ── Fetch package with AbortController
  useEffect(() => {
    if (!packageId) return;

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const data = await getPackageById(packageId);
        if (cancelled) return;
        setPkg(data);
        setNumPeople(1);
      } catch (e) {
        if (cancelled) return;
        setFetchError("Unable to load package details. Please try again.");
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [packageId]);

  // ── People stepper
  const decrement = () => setNumPeople((n) => Math.max(1, n - 1));
  const increment = () => setNumPeople((n) => Math.min(maxSlots, n + 1));

  // ── Submit handler
  const handleBook = async () => {
    if (isSubmittingRef.current) return;
    if (!isAuthenticated) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setBookingError(null);

    try {
      const result = await createBooking({
        package: packageId,
        numPeople,
      });
      setBookingSuccess(true);
      // Pass savings through router state so Booking Detail can show the loyalty toast
      const savings = result?.savings ?? 0;
      const bookingId = result?._id || result?.bookingId;

      setTimeout(
        () =>
          navigate(
            bookingId ? `/dashboard/bookings/${bookingId}` : "/dashboard",
            {
              state: { newBookingSavings: savings },
            },
          ),
        1200,
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Booking failed. Please try again.";
      setBookingError(msg);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // ── Auth loading guard (wait for auth to resolve first)
  if (authLoading) {
    return <TripFusionLoader message="Verifying your session…" />;
  }

  // ── Package fetch loading
  if (fetchLoading) {
    return <TripFusionLoader message="Loading package details…" />;
  }

  // ── Fetch error
  if (fetchError || !pkg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#0A1A44] mb-2">
            Package Not Found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {fetchError || "This package could not be loaded."}
          </p>
          <Link
            to="/packages"
            className="inline-block px-6 py-2.5 bg-[#0A1A44] text-white rounded-lg font-semibold text-sm hover:bg-[#0D9488] transition-colors"
          >
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = pkg.coverImage || pkg.image || null;
  const slotsLeft = Number(pkg.available_slot ?? 0);
  const isUnavailable = !pkg.available || slotsLeft === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#F8FAFC]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-6">
        <Link
          to={`/packages/${packageId}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1A44] hover:text-[#0D9488] transition-colors"
        >
          <ChevronLeft size={17} />
          Back to Package Details
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0A1A44] tracking-tight">
            Complete Your Booking
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review the details below and confirm your trip.
          </p>
        </div>

        <AnimatePresence>
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
              role="alert"
            >
              <LogIn
                size={20}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Please login to continue booking
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You must be signed in to confirm and manage your reservations.{" "}
                  <Link
                    to="/login"
                    className="underline font-semibold hover:text-amber-900"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            {coverImage && (
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={coverImage}
                  alt={pkg.title}
                  className="w-full h-52 sm:h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {pkg.trip_type === "international"
                  ? "International"
                  : "National"}{" "}
                • {pkg.location}
              </p>
              <h2 className="text-2xl font-black text-[#0A1A44] mt-1 tracking-tight leading-snug">
                {pkg.title}
              </h2>

              {pkg.description && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                  {pkg.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoBadge
                  icon={MapPin}
                  label="Destination"
                  value={`${pkg.location}${pkg.city ? `, ${pkg.city}` : ""}`}
                />
                <InfoBadge
                  icon={Calendar}
                  label="Travel Dates"
                  value={`${fmtDate(pkg.start_date)} – ${fmtDate(pkg.end_date)}`}
                />
                <InfoBadge
                  icon={Clock}
                  label="Duration"
                  value={
                    typeof pkg.durationDays === "number" &&
                    typeof pkg.durationNights === "number"
                      ? `${pkg.durationDays} Days / ${pkg.durationNights} Nights`
                      : "—"
                  }
                />
                <InfoBadge
                  icon={Users}
                  label="Slots Available"
                  value={
                    slotsLeft > 0
                      ? `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} left`
                      : "Fully booked"
                  }
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28">
              <h3 className="text-base font-black text-[#0A1A44] mb-5">
                Order Summary
              </h3>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Price per person</span>
                <span className="font-bold text-[#0D9488]">
                  {fmtPrice(pricePerPerson)}
                </span>
              </div>

              {/* People stepper */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-gray-600 font-medium">
                  Number of people
                </span>
                <div className="flex items-center gap-0.5 bg-gray-50 rounded-xl border border-gray-200 p-0.5">
                  <button
                    onClick={decrement}
                    disabled={numPeople <= 1 || submitting}
                    aria-label="Decrease people"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0A1A44] hover:bg-white hover:shadow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="w-9 text-center text-sm font-black text-[#0A1A44] select-none">
                    {numPeople}
                  </span>
                  <button
                    onClick={increment}
                    disabled={numPeople >= maxSlots || submitting}
                    aria-label="Increase people"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0A1A44] hover:bg-white hover:shadow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Total price */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">
                  {fmtPrice(pricePerPerson)} × {numPeople}{" "}
                  {numPeople === 1 ? "person" : "people"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-bold text-[#0A1A44]">
                  Total Price
                </span>
                <motion.span
                  key={totalPrice}
                  initial={{ scale: 0.92, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="text-2xl font-black text-[#0D9488]"
                >
                  {fmtPrice(totalPrice)}
                </motion.span>
              </div>

              {isUnavailable && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 font-medium">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  This package is currently unavailable or fully booked.
                </div>
              )}

              {/* Booking error */}
              <AnimatePresence>
                {bookingError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 font-medium"
                    role="alert"
                  >
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    {bookingError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success state */}
              <AnimatePresence>
                {bookingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs text-emerald-700 font-bold"
                  >
                    <ShieldCheck size={14} />
                    Booking confirmed! Redirecting…
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm button */}
              <button
                onClick={handleBook}
                disabled={
                  !isAuthenticated ||
                  submitting ||
                  isUnavailable ||
                  bookingSuccess
                }
                className={`
                  w-full flex items-center justify-center gap-2
                  px-6 py-3.5 rounded-xl text-sm font-black tracking-wide
                  transition-all duration-200 shadow-md
                  ${
                    !isAuthenticated || isUnavailable
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : submitting || bookingSuccess
                        ? "bg-indigo-400 text-white cursor-wait"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg active:scale-[0.98]"
                  }
                `}
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : bookingSuccess ? (
                  "Booking Confirmed ✓"
                ) : (
                  "Confirm Booking"
                )}
              </button>

              {/* Trust badge */}
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <ShieldCheck size={13} className="text-teal-500" />
                Secure booking — no payment required now
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
