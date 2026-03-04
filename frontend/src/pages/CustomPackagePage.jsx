import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Plane, BedDouble, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import {
  getCustomPackagePreview,
  confirmCustomPackage,
} from "../services/customPackage.api";
import FormSection from "../components/customPackage/FormSection";
import ProgressTracker from "../components/customPackage/ProgressTracker";
import PreviewHero from "../components/customPackage/PreviewHero";
import TripOverview from "../components/customPackage/TripOverview";
import WeatherCard from "../components/customPackage/WeatherCard";
import FlightCard from "../components/customPackage/FlightCard";
import HotelCard from "../components/customPackage/HotelCard";
import ItineraryTimeline from "../components/customPackage/ItineraryTimeline";
import PoiGrid from "../components/customPackage/PoiGrid";
import AiReasoning from "../components/customPackage/AiReasoning";
import CostSummary from "../components/customPackage/CostSummary";

// Section wrapper — consistent heading + animated reveal
const Section = ({ title, icon: Icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    {title && (
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
        {Icon && <Icon size={18} className="text-teal-600" />}
        {title}
      </h2>
    )}
    {children}
  </motion.section>
);

// Empty-state helper
const EmptyState = ({ message }) => (
  <p className="text-sm text-gray-400 italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
    {message}
  </p>
);

const MAX_SELECTION = 2;

// Page component
const CustomPackagePage = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);

  useEffect(() => {
    if (preview && !loading) setIsFormVisible(false);
  }, [preview, loading]);

  // --------------------------------------------------------------------------
  // Generate preview
  // --------------------------------------------------------------------------
  const handlePreview = useCallback(
    async (formData) => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomPackagePreview(formData);
        setPreview(data);
        setSelectedFlights([]);
        setSelectedHotels([]);
      } catch (e) {
        setError(e.message || "Failed to generate preview");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  // --------------------------------------------------------------------------
  // Flight / hotel toggle selection (max 2 each)
  // --------------------------------------------------------------------------
  const toggleSelection = useCallback((id, setSelected) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      const next = [...prev, id];
      if (next.length > MAX_SELECTION) next.shift();
      return next;
    });
  }, []);

  const handleFlightSelect = useCallback(
    (id) => toggleSelection(id, setSelectedFlights),
    [toggleSelection],
  );
  const handleHotelSelect = useCallback(
    (id) => toggleSelection(id, setSelectedHotels),
    [toggleSelection],
  );

  // --------------------------------------------------------------------------
  // Confirm package
  // --------------------------------------------------------------------------
  const handleConfirm = useCallback(async () => {
    if (!preview || !isAuthenticated) return;
    setLoading(true);
    try {
      const res = await confirmCustomPackage(preview);
      const packageId = res.packageId || res._id;
      navigate(`/chat/${packageId}`);
    } catch (e) {
      setError(e.message || "Failed to confirm package");
    } finally {
      setLoading(false);
    }
  }, [preview, isAuthenticated, navigate]);

  // --------------------------------------------------------------------------
  // Derived data — all sourced from the real backend shape
  // --------------------------------------------------------------------------

  // All flight offers (shown to user so they can pick)
  const allFlightOffers = preview?.flights?.offers ?? [];

  // AI-curated flight IDs for highlighting
  const aiFlightIds = useMemo(
    () => new Set((preview?.selectedFlights ?? []).map((f) => f.flightId)),
    [preview],
  );

  // All hotels from destination (show even if available: false)
  const allHotels = useMemo(
    () => preview?.destination?.hotels ?? preview?.hotelsSnapshot ?? [],
    [preview],
  );

  // AI-curated hotel IDs
  const aiHotelIds = useMemo(
    () => new Set((preview?.selectedHotels ?? []).map((h) => h.hotelId)),
    [preview],
  );

  // Rich weather from destination; fall back to snapshot
  const weatherData =
    preview?.destination?.weather ?? preview?.weatherSnapshot ?? [];

  // Selected flight / hotel objects for CostSummary
  const selectedFlightObjs = useMemo(
    () => allFlightOffers.filter((f) => selectedFlights.includes(f.flightId)),
    [allFlightOffers, selectedFlights],
  );
  const selectedHotelObjs = useMemo(
    () => allHotels.filter((h) => selectedHotels.includes(h.hotelId)),
    [allHotels, selectedHotels],
  );

  // Render
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 mt-10">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center"
          >
            <ProgressTracker isActive={true} isComplete={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && (
        <div
          role="alert"
          className="flex items-start gap-3 mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm"
        >
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} />
          <p className="text-sm font-medium text-amber-800 leading-relaxed">
            Please{" "}
            <Link
              to="/login"
              className="underline underline-offset-2 hover:text-amber-900 font-semibold"
            >
              log in
            </Link>{" "}
            to generate and discuss a personalised travel package with our
            advisors. You can explore the form below, but generation is only
            available to registered users.
          </p>
        </div>
      )}

      {isFormVisible && (
        <FormSection
          onSubmit={handlePreview}
          isLoading={loading}
          isAuthenticated={isAuthenticated}
        />
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AnimatePresence>
        {isAuthenticated && preview && !loading && !isFormVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-8 mt-10"
          >
            <button
              type="button"
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ChevronLeft size={18} />
              Edit Package
            </button>

            {/* 1. Hero image */}
            <PreviewHero
              destinationImage={preview?.destinationImage}
              destinationName={preview?.destination?.name}
            />

            {/* 2. Trip Overview */}
            <TripOverview preview={preview} />

            {/* 3. Weather */}
            {weatherData?.length > 0 && <WeatherCard weather={weatherData} />}

            {/* 4. Flights */}
            <Section title="Available Flights" icon={Plane}>
              {allFlightOffers?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allFlightOffers.map((flight) => (
                    <FlightCard
                      key={flight?.flightId}
                      flight={flight}
                      isSelected={selectedFlights.includes(flight?.flightId)}
                      onSelect={handleFlightSelect}
                      isAiPick={aiFlightIds.has(flight?.flightId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No flights available for this route." />
              )}
            </Section>

            {/* 5. Hotels */}
            <Section title="Recommended Hotels" icon={BedDouble}>
              {allHotels?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allHotels.map((hotel) => (
                    <HotelCard
                      key={hotel?.hotelId}
                      hotel={hotel}
                      isSelected={selectedHotels.includes(hotel?.hotelId)}
                      onSelect={handleHotelSelect}
                      isAiPick={aiHotelIds.has(hotel?.hotelId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No hotel options available for these dates." />
              )}
            </Section>

            {/* 6. Itinerary */}
            <ItineraryTimeline itinerary={preview?.itinerary} />

            {/* 7. POIs */}
            {(preview?.poisSnapshot?.length > 0 || preview?.pois?.length > 0) && (
              <PoiGrid pois={preview?.poisSnapshot ?? preview?.pois} />
            )}

            {/* 8. Cost summary */}
            <CostSummary
              selectedFlights={selectedFlightObjs}
              selectedHotels={selectedHotelObjs}
            />

            {/* 9. AI Reasoning */}
            <AiReasoning reasoning={preview?.reasoningSummary} />

            {/* 10. Confirm CTA */}
            <div className="flex justify-center mt-6 pb-4">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-100"
                style={{
                  background: "linear-gradient(135deg, #0D9488, #0A1A44)",
                }}
              >
                {loading
                  ? "Confirming…"
                  : "Confirm & Discuss With Travel Advisor"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomPackagePage;
