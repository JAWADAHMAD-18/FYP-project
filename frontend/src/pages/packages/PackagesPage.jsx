import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import PackageSkeleton from "../../components/Loader/PackageSkeleton.jsx";
import { getPackages } from "../../services/package.service.js";
import { useAuth } from "../../context/useAuth.js";
import PackageCard from "../../components/Cards/PackagesCard.jsx";
import PackagesFilters from "./components/PackagesFilters.jsx";
import PackagesGrid from "./components/PackagesGrid.jsx";
import ShowMoreButton from "./components/ShowMoreButton.jsx";
import { matchesSearch, normalizeTripTypeToApi } from "./utils.js";

const INITIAL_VISIBLE = 20;
const PAGE_SIZE = 20;

export default function PackagesPage() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters (client-side only)
  const [tripType, setTripType] = useState(null); // "national" | "international" | null
  const [category, setCategory] = useState(null); // destination bucket (currently location)
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination UX (no extra API calls)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // Fetch ONCE on mount (service already dedupes + caches)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPackages();
        if (!cancelled) setAllPackages(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setError("Unable to load packages. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [tripType, category, searchQuery]);

  const filteredPackages = useMemo(() => {
    if (!allPackages.length) return [];

    let result = allPackages;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tripType) {
      const apiTripType = normalizeTripTypeToApi(tripType);
      result = result.filter((p) => p?.trip_type === apiTripType);
    }

    // category is a destination bucket (currently location)
    if (category) {
      result = result.filter((p) => p?.location === category);
    }

    if (searchQuery?.trim()) {
      result = result.filter((p) => matchesSearch(p, searchQuery));
    }

    result = result.filter(
      (p) => p?.available === true && new Date(p?.start_date) >= today,
    );

    return result;
  }, [allPackages, tripType, category, searchQuery]);

  const expiredPackages = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isAdmin) return [];

    return allPackages.filter(
      (pkg) => new Date(pkg?.start_date) < today,
    );
  }, [allPackages, isAdmin]);

  const canShowMore = filteredPackages.length > visibleCount;

  const onTripTypeChange = useCallback((next) => {
    setTripType((prev) => (prev === next ? null : next));
    setCategory(null); // cascading reset
  }, []);

  const onCategoryChange = useCallback(
    (next) => setCategory((prev) => (prev === next ? null : next)),
    [],
  );

  const onSearchChange = useCallback((next) => setSearchQuery(next), []);

  const onReset = useCallback(() => {
    setTripType(null);
    setCategory(null);
    setSearchQuery("");
  }, []);

  const onShowMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredPackages.length));
  }, [filteredPackages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <PackageSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#0A1A44] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0A1A44] text-white rounded-lg font-semibold hover:bg-[#0D9488] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#F8FAFC]"
    >
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0A1A44] via-[#1E3A5F] to-[#0A1A44] text-white py-6 mt-14">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Browse packages and filter instantly for your perfect trip.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <PackagesFilters
            allPackages={allPackages}
            selectedTripType={tripType}
            selectedCategory={category}
            searchQuery={searchQuery}
            onTripTypeChange={onTripTypeChange}
            onCategoryChange={onCategoryChange}
            onSearchChange={onSearchChange}
            onReset={onReset}
          />

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {Math.min(visibleCount, filteredPackages.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {filteredPackages.length}
              </span>
            </p>
          </div>

          <PackagesGrid
            packages={filteredPackages}
            visibleCount={visibleCount}
            onCardVisibleKey={`${tripType || "all"}|${category || "all"}|${
              searchQuery || ""
            }`}
          />

          {canShowMore && (
            <ShowMoreButton onClick={onShowMore} disabled={!canShowMore} />
          )}

          {isAdmin === true && expiredPackages.length > 0 && (
            <div className="mt-14">
              <div className="border-t border-gray-100 pt-8 mb-6">
                <h2 className="text-2xl font-black text-[#0A1A44]">
                  Expired Packages
                </h2>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {expiredPackages.map((pkg) => (
                  <motion.div
                    key={pkg._id || pkg.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <PackageCard packageData={pkg} isExpired={true} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
