import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Users,
  MapPin,
  BadgeDollarSign,
  CreditCard,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Plane,
  BedDouble,
} from "lucide-react";
import TripFusionLoader from "../../components/Loader/TripFusionLoader.jsx";
import {
  getMyBookingById,
  uploadPaymentProof,
} from "../../services/booking.service.js";
import SavingsToast from "../../components/dashboard/SavingsToasts";

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

export default function BookingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const paymentSectionRef = useRef(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastSavings] = useState(() => location.state?.newBookingSavings ?? null);
  const [showToast, setShowToast] = useState(() => {
    const val = location.state?.newBookingSavings;
    return typeof val === "number" && val > 0;
  });
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyBookingById(id);
        if (cancelled) return;
        setBooking(data);
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Unable to load booking details.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const paymentStatus = booking?.payment_status || "pending_payment";
  const bookingStatus = booking?.bookingStatus || "Pending";
  const persistedPaymentProof = booking?.paymentProof || null;
  const persistedPaymentNote = booking?.payment_note || booking?.paymentNote || "";
  const canUploadPaymentProof = ["pending_payment", "refunded", "payment_failed"].includes(
    paymentStatus,
  );

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (loading || error || !booking) return;
    paymentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [loading, error, booking]);

  useEffect(() => {
    const hasSavingsInState = typeof location.state?.newBookingSavings === "number";
    if (hasSavingsInState) {
      window.history.replaceState({}, document.title, window.location.href);
    }
  }, [location.state]);

  const handleCloseToast = () => {
    setShowToast(false);
    window.history.replaceState({}, document.title, window.location.href);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    if (!file) {
      setSubmitError("Please select an image to upload.");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setSubmitting(true);
      const fd = new FormData();
      fd.append("paymentProof", file);
      if (note?.trim()) fd.append("payment_note", note.trim());

      const updated = await uploadPaymentProof(id, fd);
      setBooking(updated);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (loading) return <TripFusionLoader message="Loading booking details…" />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 pt-24 pb-16">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#0A1A44] mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {error || "This booking could not be loaded."}
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2.5 bg-[#0A1A44] text-white rounded-lg font-semibold text-sm hover:bg-[#0D9488] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const destination = booking?.packageSnapshot?.destination || "Destination";
  const title = booking?.packageSnapshot?.title || "Trip Booking";
  const durationDays = booking?.packageSnapshot?.durationDays;
  const includes = booking?.packageSnapshot?.includes || [];
  const excludes = booking?.packageSnapshot?.excludes || [];
  const isCustom = booking?.bookingType === "custom";
  const snapFlights = booking?.packageSnapshot?.selectedFlights || [];
  const snapHotels = booking?.packageSnapshot?.selectedHotels || [];
  const snapItinerary = booking?.packageSnapshot?.itinerary || [];

  const paymentBadge =
    paymentStatus === "payment_verified"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : paymentStatus === "payment_submitted"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : paymentStatus === "payment_failed" || paymentStatus === "refunded"
          ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
  const paymentStatusLabel =
    paymentStatus === "pending_payment"
      ? "Pending Payment"
      : paymentStatus === "payment_submitted"
        ? "Under Review"
        : paymentStatus === "payment_verified"
          ? "Confirmed"
          : paymentStatus === "payment_failed" || paymentStatus === "refunded"
            ? "Retry Required"
            : paymentStatus.replaceAll("_", " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#F8FAFC]"
    >
      {showToast && toastSavings > 0 && (
        <SavingsToast savings={toastSavings} onClose={handleCloseToast} />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1A44] hover:text-[#0D9488] transition-colors"
        >
          <ChevronLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Booking Details
            </p>
            <h1 className="text-3xl font-black text-[#0A1A44] tracking-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-sm font-medium">
                {destination}
              </p>
              {isCustom && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                  Custom Trip
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-200">
              {bookingStatus}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${paymentBadge}`}
            >
              {paymentStatusLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Booking info */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-[#0A1A44] mb-5">
                Booking Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <MapPin size={14} className="text-teal-600" />
                    Destination
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {destination}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Calendar size={14} className="text-teal-600" />
                    Travel Dates
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {isCustom && booking?.packageSnapshot?.start_date
                      ? `${fmtDate(booking.packageSnapshot.start_date)} – ${fmtDate(booking.packageSnapshot.end_date)}`
                      : fmtDate(booking.travelDate)}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Users size={14} className="text-teal-600" />
                    Travelers
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {booking.numPeople || 1}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <BadgeDollarSign size={14} className="text-teal-600" />
                    Total Price
                  </div>
                  <div className="mt-2 text-sm font-black text-teal-700">
                    {fmtPrice(booking.totalPrice)}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Booking ID
                </p>
                <p className="mt-1 font-mono text-sm text-gray-800 break-all">
                  {booking._id}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-[#0A1A44] mb-4">
                Package Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {typeof durationDays === "number"
                      ? `${durationDays} Days`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Base Price (per person)
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {fmtPrice(booking?.pricePerPerson)}
                  </p>
                </div>
              </div>

              {(includes.length > 0 || excludes.length > 0) && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Includes
                    </p>
                    {includes.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {includes.slice(0, 6).map((item, idx) => (
                          <li key={`${item}-${idx}`} className="flex gap-2">
                            <span className="text-teal-600 font-black">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">—</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Excludes
                    </p>
                    {excludes.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {excludes.slice(0, 6).map((item, idx) => (
                          <li key={`${item}-${idx}`} className="flex gap-2">
                            <span className="text-rose-600 font-black">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Trip Details — only for custom bookings */}
            {isCustom && (snapFlights.length > 0 || snapHotels.length > 0 || snapItinerary.length > 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-black text-[#0A1A44] mb-4">
                  Custom Trip Details
                </h2>

                {snapFlights.length > 0 && (
                  <div className="mb-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                      <Plane size={14} className="text-teal-600" />
                      Selected Flights
                    </p>
                    <div className="space-y-2">
                      {snapFlights.map((f, i) => {
                        const price =
                          typeof f?.price === "object" && f?.price?.total
                            ? `${f.price.currency ?? "USD"} ${f.price.total}`
                            : f?.price != null
                              ? String(f.price)
                              : "—";
                        return (
                          <div key={f?.flightId ?? i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                            <p className="text-sm font-bold text-gray-900">
                              {f?.airline ?? "Flight"} • {price}
                            </p>
                            {(f?.duration || f?.stops != null) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {f?.duration ? String(f.duration).replace(/^PT/, "") : ""}
                                {f?.stops != null ? ` • ${f.stops} stop${f.stops !== 1 ? "s" : ""}` : ""}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {snapHotels.length > 0 && (
                  <div className="mb-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                      <BedDouble size={14} className="text-teal-600" />
                      Selected Hotels
                    </p>
                    <div className="space-y-2">
                      {snapHotels.map((h, i) => {
                        const priceStr =
                          typeof h?.price === "object" && h?.price?.total
                            ? `${h.price.currency ?? "EUR"} ${h.price.total}/night`
                            : h?.price
                              ? `${h.price}/night`
                              : "";
                        return (
                          <div key={h?.hotelId ?? i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                            <p className="text-sm font-bold text-gray-900">
                              {h?.name ?? h?.hotelName ?? "Hotel"}
                            </p>
                            {priceStr && (
                              <p className="text-xs text-gray-500 mt-0.5">{priceStr}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {snapItinerary.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                      Day-by-Day Itinerary
                    </p>
                    <div className="space-y-2">
                      {snapItinerary.map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                          <p className="text-sm font-bold text-teal-700 mb-1">
                            Day {item?.day ?? i + 1}: {item?.title ?? "—"}
                          </p>
                          {Array.isArray(item?.activities) ? (
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                              {item.activities.map((act, j) => (
                                <li key={j}>{act}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-600">
                              {item?.description ?? item?.activity ?? "—"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-[#0A1A44] mb-4">
                Bank Transfer Payment
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Bank Name
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    Meezan Bank
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Account Title
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    AI Travel Agency
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Account Number
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    1234-5678901
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    IBAN
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900 break-all">
                    PK00MEZN000123456789
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                After sending payment through bank transfer, please upload the
                payment receipt or screenshot as proof.
              </p>
            </div>
          </div>

          {/* Right: Payment proof upload */}
          <div className="lg:col-span-2">
            <div
              id="payment-section"
              ref={paymentSectionRef}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28"
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-teal-600" />
                <h2 className="text-base font-black text-[#0A1A44]">
                  Payment Proof
                </h2>
              </div>

              {paymentStatus === "pending_payment" && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-700 font-medium">
                  <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>⚡ Pay now to confirm your trip faster</p>
                    <p className="mt-1">
                      Bookings are confirmed only after payment verification.
                      Early payment ensures availability.
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === "payment_submitted" && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-700 font-medium">
                  <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                  Your payment is under review. This usually takes a few hours.
                </div>
              )}

              {paymentStatus === "payment_verified" && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-xs text-emerald-700 font-medium">
                  <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                  ✅ Your booking is confirmed
                </div>
              )}

              {paymentStatus === "refunded" && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700 font-medium">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  Your payment was not approved. Please upload a valid proof
                  again.
                </div>
              )}

              {persistedPaymentProof && (
                <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Last uploaded proof
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${paymentBadge}`}
                    >
                      {paymentStatusLabel}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
                    <img
                      src={persistedPaymentProof}
                      alt="Uploaded payment proof"
                      className="w-full h-40 object-cover"
                    />
                  </div>

                  {persistedPaymentNote && (
                    <div className="mt-2 text-xs text-gray-600 rounded-lg bg-white border border-gray-100 px-3 py-2">
                      {persistedPaymentNote}
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 font-medium"
                    role="alert"
                  >
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs text-emerald-700 font-bold"
                  >
                    <ShieldCheck size={14} />
                    Upload successful.
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Payment Screenshot (jpg/jpeg/png/webp, max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    disabled={!canUploadPaymentProof || submitting}
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFile(f);
                      setSubmitSuccess(false);
                      setSubmitError(null);
                    }}
                    className="block w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-teal-600 file:text-white file:font-bold hover:file:bg-teal-700 disabled:opacity-60"
                  />
                </div>

                {previewUrl && (
                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={note}
                    disabled={!canUploadPaymentProof || submitting}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="If you want to leave a message (for example: transaction reference or notes), you can add it here."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canUploadPaymentProof || submitting}
                  className={`
                    w-full flex items-center justify-center gap-2
                    px-6 py-3.5 rounded-xl text-sm font-black tracking-wide
                    transition-all duration-200 shadow-md
                    ${
                      !canUploadPaymentProof
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : submitting
                          ? "bg-indigo-400 text-white cursor-wait"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg active:scale-[0.98]"
                    }
                  `}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} />
                      Submit Payment Proof
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
