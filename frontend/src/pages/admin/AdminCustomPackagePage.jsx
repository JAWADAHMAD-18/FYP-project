import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomPackageByRequestId } from "../../services/customPackage.api";
import TripFusionLoader from "../../components/Loader/TripFusionLoader";
import { ChevronLeft, Plane, BedDouble, MapPin } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveDestinationName(doc) {
  const dest =
    doc?.inputSnapshot?.destination ??
    doc?.inputSnapshot?.locations?.[doc?.inputSnapshot?.locations?.length - 1] ??
    doc?.inputSnapshot?.locations?.[0];
  if (!dest) return "—";
  if (typeof dest === "string") return dest;
  if (typeof dest?.name === "string") return dest.name;
  return "—";
}

const AdminCustomPackagePage = () => {
  const { requestId } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    getCustomPackageByRequestId(requestId)
      .then(setDoc)
      .catch((e) => setError(e.message || "Failed to load package"))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return <TripFusionLoader message="Loading package..." />;
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="bg-red-50 text-red-600 rounded-2xl px-8 py-6 text-center max-w-md">
          <p className="font-semibold text-lg mb-2">Could not load package</p>
          <p className="text-sm text-red-500 mb-4">{error || "Not found"}</p>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700"
          >
            <ChevronLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const destination = resolveDestinationName(doc);
  const flights = doc?.flightsSnapshot ?? [];
  const hotels = doc?.hotelsSnapshot ?? [];
  const itinerary = doc?.itinerary ?? [];
  const pois = doc?.poisSnapshot ?? [];
  const budget = doc?.inputSnapshot?.budgetPreference ?? "—";

  return (
    <div className="min-h-screen bg-gray-50/50 py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#0A1A44]">
              Custom Package: {requestId}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                doc.status === "finalized"
                  ? "bg-green-100 text-green-700"
                  : doc.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {doc.status}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Destination</p>
                <p className="font-semibold text-[#0A1A44]">{destination}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Travelers</p>
                <p className="font-semibold text-[#0A1A44]">
                  {doc?.inputSnapshot?.adults ?? "—"} adults
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Dates</p>
                <p className="font-medium text-[#0A1A44] text-sm">
                  {formatDate(doc?.inputSnapshot?.start_date)} –{" "}
                  {formatDate(doc?.inputSnapshot?.end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Budget</p>
                <p className="font-medium text-[#0A1A44] capitalize">
                  {String(budget).toLowerCase()}
                </p>
              </div>
            </div>

            {flights.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
                  <Plane size={18} className="text-teal-600" />
                  Flights
                </h2>
                <div className="space-y-3">
                  {flights.map((f, i) => {
                    const price =
                      typeof f?.price === "object" && f?.price?.total
                        ? `${f.price.currency ?? "USD"} ${f.price.total}`
                        : typeof f?.price === "number" || typeof f?.price === "string"
                          ? String(f.price)
                          : "—";
                    return (
                      <div
                        key={f?.flightId ?? i}
                        className="p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                      >
                        <p className="font-medium text-[#0A1A44]">
                          {f?.airline ?? f?.carrier ?? "Flight"} • {price}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {f?.duration ? String(f.duration).replace(/^PT/, "") : ""}
                          {f?.stops != null ? ` • ${f.stops} stop${f.stops !== 1 ? "s" : ""}` : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {hotels.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
                  <BedDouble size={18} className="text-teal-600" />
                  Hotels
                </h2>
                <div className="space-y-3">
                  {hotels.map((h, i) => {
                    const priceStr =
                      typeof h?.price === "object" && h?.price?.total
                        ? `${h.price.currency ?? "EUR"} ${h.price.total}/night`
                        : h?.price
                          ? `${h.price}/night`
                          : "—";
                    return (
                      <div
                        key={h?.hotelId ?? i}
                        className="p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                      >
                        <p className="font-medium text-[#0A1A44]">
                          {h?.name ?? h?.hotelName ?? "—"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{priceStr}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {itinerary.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
                  Itinerary
                </h2>
                <ul className="space-y-3">
                  {itinerary.map((item, i) => (
                    <li
                      key={i}
                      className="p-4 rounded-lg bg-gray-50/50 border border-gray-100"
                    >
                      <p className="text-teal-600 font-semibold mb-2">
                        Day {item?.day ?? i + 1}: {item?.title ?? "—"}
                      </p>
                      {Array.isArray(item?.activities) ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {item.activities.map((act, j) => (
                            <li key={j}>{act}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-700 text-sm">
                          {item?.description ?? item?.activity ?? "—"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {pois.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
                  <MapPin size={18} className="text-teal-600" />
                  Points of Interest
                </h2>
                <div className="flex flex-wrap gap-2">
                  {pois.map((p, i) => (
                    <span
                      key={p?.id ?? i}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium"
                    >
                      {p?.name ?? p?.title ?? "—"}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomPackagePage;
