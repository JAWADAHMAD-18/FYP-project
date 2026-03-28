import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, CalendarCheck } from "lucide-react";
import TripFusionLoader from "../../components/Loader/TripFusionLoader";
import BookingsTable from "../../sections/adminBookings/BookingsTable";
import {
  getAllBookings,
  searchBookings,
} from "../../services/admin/adminBooking.services";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}
//inline helper
function SectionEmptyState({ label }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-12 text-center">
      <CalendarCheck size={40} className="mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">{label}</p>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput.trim(), 1000);

  // Scroll refs — one per booking-status section
  const pendingRef   = useRef(null);
  const confirmedRef = useRef(null);
  const cancelledRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const doSearch = useCallback(async (term) => {
    if (!term) {
      fetchAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchBookings({ q: term });
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Search failed");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    if (debouncedSearch) {
      doSearch(debouncedSearch);
    } else {
      fetchAll();
    }
  }, [debouncedSearch, doSearch, fetchAll]);

  // Future backend optimization: GET /admin/bookings?status=pending|confirmed|cancelled
  // would reduce client-side filtering and improve scalability at scale.

  // Strict priority: Cancelled → Confirmed+Paid → Pending (fallback). No duplication.
  // Only bookingStatus and paymentStatus are used — no other payment-related fields.
  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "Cancelled"),
    [bookings]
  );
  const confirmedBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.bookingStatus === "Confirmed" && b.paymentStatus === "Paid"
      ),
    [bookings]
  );
  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.bookingStatus !== "Cancelled" &&
          !(b.bookingStatus === "Confirmed" && b.paymentStatus === "Paid")
      ),
    [bookings]
  );

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gray-50/50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50">
              <CalendarCheck size={22} className="text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Bookings
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Search by booking code, user ID, or package ID
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
              />
            </div>
            <button
              onClick={() => {
                setSearchInput("");
                fetchAll();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* ── Section navigation buttons — centered below the header row ── */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => scrollTo(pendingRef)}
            className="px-5 py-2 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700 text-sm font-medium hover:bg-yellow-100 hover:border-yellow-300 transition"
          >
            Pending
          </button>
          <button
            onClick={() => scrollTo(confirmedRef)}
            className="px-5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 hover:border-teal-300 transition"
          >
            Confirmed
          </button>
          <button
            onClick={() => scrollTo(cancelledRef)}
            className="px-5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 hover:border-red-300 transition"
          >
            Cancelled
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && <TripFusionLoader message="Loading bookings..." />}

        {!loading && (
          <>
            <div ref={pendingRef}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Pending Bookings
              </h2>
              {pendingBookings.length > 0 ? (
                <BookingsTable bookings={pendingBookings} />
              ) : (
                <SectionEmptyState label="No Pending Bookings" />
              )}
            </div>

            <div ref={confirmedRef} className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmed Bookings
              </h2>
              {confirmedBookings.length > 0 ? (
                <BookingsTable bookings={confirmedBookings} />
              ) : (
                <SectionEmptyState label="No Confirmed Bookings" />
              )}
            </div>

            <div ref={cancelledRef} className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Cancelled Bookings
              </h2>
              {cancelledBookings.length > 0 ? (
                <BookingsTable bookings={cancelledBookings} />
              ) : (
                <SectionEmptyState label="No Cancelled Bookings" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
