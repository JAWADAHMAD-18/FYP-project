import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Clock,
  Users,
} from "lucide-react";
import PackageCard from "../../components/Cards/PackagesCard.jsx";
import PackageSkeleton from "../../components/Loader/PackageSkeleton.jsx";
import { getPackageById, getPackages } from "../../services/package.service.js";
import FavouriteButton from "./components/FavouriteButton";
import BookingButton from "./components/BookingButton";

function normalizeTripTypeLabel(apiTripType) {
  if (apiTripType === "domestic") return "National";
  if (apiTripType === "international") return "International";
  return apiTripType;
}

function normalizeImages(pkg) {
  const cover = pkg?.coverImage || pkg?.image;
  const arr = Array.isArray(pkg?.images) ? pkg.images.filter(Boolean) : [];
  const merged = [...new Set([cover, ...arr].filter(Boolean))];
  return merged;
}

export default function PackageDetailPage() {
  const { id } = useParams();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPackageById(id);
        if (cancelled) return;
        setPkg(data);
        const imgs = normalizeImages(data);
        setActiveImage(imgs[0] || null);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setError("Unable to load this package. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const galleryImages = useMemo(() => normalizeImages(pkg), [pkg]);

  // Load recommendations from cached list, without blocking details UI.
  const [recommendedList, setRecommendedList] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!pkg?._id || !pkg?.trip_type) return;
      try {
        const all = await getPackages(); // cached/deduped
        if (cancelled) return;
        const sameType = (all || []).filter(
          (p) => p?.trip_type === pkg.trip_type && p?._id !== pkg._id,
        );
        // Random 3
        const shuffled = sameType
          .map((v) => ({ v, r: Math.random() }))
          .sort((a, b) => a.r - b.r)
          .map((x) => x.v);
        setRecommendedList(shuffled.slice(0, 3));
      } catch {
        // keep recommendations optional + silent
        setRecommendedList([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pkg?._id, pkg?.trip_type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <PackageSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#0A1A44] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error || "Not found."}</p>
          <Link
            to="/packages"
            className="inline-block px-6 py-3 bg-[#0A1A44] text-white rounded-lg font-semibold hover:bg-[#0D9488] transition-colors"
          >
            Back to Packages
          </Link>
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
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-6">
        <Link
          to="/packages"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0A1A44] hover:text-[#0D9488] transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Packages
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={pkg.title}
                  className="w-full h-[380px] object-cover"
                />
              ) : (
                <div className="w-full h-[380px] flex items-center justify-center text-gray-400">
                  <ImageIcon size={40} />
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {galleryImages.slice(0, 5).map((src) => (
                  <button
                    key={src}
                    onClick={() => setActiveImage(src)}
                    className={`rounded-xl overflow-hidden border transition ${
                      src === activeImage
                        ? "border-[#0D9488] ring-2 ring-[#0D9488]/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    aria-label="Select image"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-16 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {normalizeTripTypeLabel(pkg.trip_type)} •{" "}
                  {(pkg.city || pkg.location || "").toString()}
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-[#0A1A44] mt-2 tracking-tight">
                  {pkg.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 font-medium">
                  Price per person
                </p>
                <p className="text-3xl font-black text-[#0D9488]">
                  ${Number(pkg.price || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-gray-700">
              <p className="text-sm leading-relaxed">{pkg.description}</p>

              {pkg.highlights && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1A44] mb-2">
                    Highlights
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {pkg.highlights}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Location
                </p>
                <p className="mt-2 font-semibold text-[#0A1A44] flex items-center gap-2">
                  <MapPin size={16} className="text-[#0D9488]" />
                  {pkg.location || "—"}
                  {pkg.city ? <span className="text-gray-400">•</span> : null}
                  {pkg.city ? (
                    <span className="text-gray-700">{pkg.city}</span>
                  ) : null}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Dates
                </p>
                <p className="mt-2 font-semibold text-[#0A1A44] flex items-center gap-2">
                  <Calendar size={16} className="text-[#0D9488]" />
                  {pkg.start_date
                    ? new Date(pkg.start_date).toLocaleDateString()
                    : "—"}{" "}
                  -{" "}
                  {pkg.end_date
                    ? new Date(pkg.end_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Duration
                </p>
                <p className="mt-2 font-semibold text-[#0A1A44] flex items-center gap-2">
                  <Clock size={16} className="text-[#0D9488]" />
                  {pkg.duration || "—"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Availability
                </p>
                <p className="mt-2 font-semibold text-[#0A1A44] flex items-center gap-2">
                  <Users size={16} className="text-[#0D9488]" />
                  {typeof pkg.available_slot === "number"
                    ? `${pkg.available_slot} slots`
                    : "—"}
                  {pkg.available === true ? (
                    <span className="ml-2 text-xs font-bold text-[#0D9488]">
                      Available
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <BookingButton
                packageId={pkg._id}
                className="flex-1 sm:flex-none"
              />
              <div className="flex items-center justify-center w-full sm:w-auto">
                <FavouriteButton
                  size={26}
                  packageId={pkg._id}
                  className="p-3 w-full sm:w-auto justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div className="mt-14">
          <h2 className="text-2xl font-black text-[#0A1A44] mb-6">
            Recommended Packages
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedList.map((p) => (
              <motion.div
                key={p._id || p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35 }}
                whileHover={{ y: -4 }}
              >
                <PackageCard packageData={p} />
              </motion.div>
            ))}
            {recommendedList.length === 0 && (
              <div className="text-gray-500 text-sm">
                No recommendations available.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
