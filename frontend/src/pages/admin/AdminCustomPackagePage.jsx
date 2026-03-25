import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCustomPackageByRequestId,
  adminPartialUpdatePackage,
} from "../../services/customPackage.api";
import { useToast } from "../../context/ToastContext";
import TripFusionLoader from "../../components/Loader/TripFusionLoader";
import {
  ChevronLeft,
  Plane,
  BedDouble,
  MapPin,
  Pencil,
  X,
  Plus,
  Save,
} from "lucide-react";

// helpers
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
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

const BLANK_FLIGHT = { airline: "", price: "", duration: "", stops: "" };
const BLANK_HOTEL  = { name: "", price: "" };
//tiny sub-particles
function SectionHeading({ icon, label }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
      {icon}
      {label}
    </h2>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="font-semibold text-[#0A1A44]">{value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────── */
const AdminCustomPackagePage = () => {
  const { requestId } = useParams();
  const { addToast } = useToast();

  const [doc, setDoc]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // edit-mode state
  const [editMode, setEditMode]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [draftPrice, setDraftPrice]     = useState("");
  const [draftFlights, setDraftFlights] = useState([]);
  const [draftHotels, setDraftHotels]   = useState([]);

  /* load doc */
  const loadDoc = useCallback(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    getCustomPackageByRequestId(requestId)
      .then(setDoc)
      .catch((e) => setError(e.message || "Failed to load package"))
      .finally(() => setLoading(false));
  }, [requestId]);

  useEffect(() => { loadDoc(); }, [loadDoc]);

  /* enter edit mode — snapshot draft from current doc */
  const enterEdit = useCallback(() => {
    if (!doc || doc.status === "finalized") return;
    setDraftPrice(doc.adminFinalPrice != null ? String(doc.adminFinalPrice) : "");
    setDraftFlights(
      doc.selectedFlights?.length
        ? doc.selectedFlights.map((f) => ({
            airline: f.airline ?? f.carrier ?? "",
            price: f.price != null ? String(f.price) : "",
            duration: f.duration ?? "",
            stops: f.stops != null ? String(f.stops) : "",
          }))
        : [{ ...BLANK_FLIGHT }]
    );
    setDraftHotels(
      doc.selectedHotels?.length
        ? doc.selectedHotels.map((h) => ({
            name: h.name ?? h.hotelName ?? "",
            price: h.price != null ? String(h.price) : "",
          }))
        : [{ ...BLANK_HOTEL }]
    );
    setEditMode(true);
  }, [doc]);

  const cancelEdit = useCallback(() => { setEditMode(false); }, []);

  /* save */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {};

      if (draftPrice.trim() !== "") {
        const v = Number(draftPrice);
        if (!Number.isFinite(v) || v <= 0) {
          addToast("Admin price must be a positive number", "error");
          setSaving(false);
          return;
        }
        payload.adminFinalPrice = v;
      }

      payload.selectedFlights = draftFlights
        .filter((f) => f.airline.trim())
        .map((f) => ({
          airline: f.airline.trim(),
          price: f.price ? Number(f.price) : null,
          duration: f.duration.trim() || null,
          stops: f.stops !== "" ? Number(f.stops) : null,
        }));

      payload.selectedHotels = draftHotels
        .filter((h) => h.name.trim())
        .map((h) => ({
          name: h.name.trim(),
          price: h.price ? Number(h.price) : null,
        }));

      const updated = await adminPartialUpdatePackage(requestId, payload);
      setDoc(updated);
      setEditMode(false);
      addToast("Package updated successfully", "success");
    } catch (e) {
      addToast(e?.response?.data?.message || "Update failed, please try again", "error");
    } finally {
      setSaving(false);
    }
  }, [requestId, draftPrice, draftFlights, draftHotels, addToast]);

  /* flight draft helpers */
  const updateFlight = (i, field, val) =>
    setDraftFlights((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  const addFlight    = () => setDraftFlights((prev) => [...prev, { ...BLANK_FLIGHT }]);
  const removeFlight = (i) => setDraftFlights((prev) => prev.filter((_, idx) => idx !== i));

  /* hotel draft helpers */
  const updateHotel = (i, field, val) =>
    setDraftHotels((prev) => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  const addHotel    = () => setDraftHotels((prev) => [...prev, { ...BLANK_HOTEL }]);
  const removeHotel = (i) => setDraftHotels((prev) => prev.filter((_, idx) => idx !== i));

  /* ── render guards ── */
  if (loading) return <TripFusionLoader message="Loading package..." />;
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
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* derived display values */
  const destination    = resolveDestinationName(doc);
  const budget         = doc?.inputSnapshot?.budgetPreference ?? "—";
  const itinerary      = doc?.itinerary ?? [];
  const pois           = doc?.poisSnapshot ?? [];
  const snapshotFlights = doc?.flightsSnapshot ?? [];
  const snapshotHotels  = doc?.hotelsSnapshot ?? [];
  const adminFlights    = doc?.selectedFlights ?? [];
  const adminHotels     = doc?.selectedHotels ?? [];
  const canEdit         = doc.status !== "finalized";

  const statusColor =
    doc.status === "finalized" ? "bg-green-100 text-green-700"
    : doc.status === "cancelled" ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700";

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1A44] focus:outline-none focus:ring-2 focus:ring-teal-400";

  return (
    <div className="min-h-screen bg-gray-50/50 py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* ── card header ── */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#0A1A44] truncate">
                Custom Package: {requestId}
              </h1>
              {doc.lastModifiedAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Last edited {formatDate(doc.lastModifiedAt)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}>
                {doc.status}
              </span>
              {canEdit && !editMode && (
                <button
                  onClick={enterEdit}
                  title="Edit package"
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* ── trip summary ── */}
            <InfoGrid
              items={[
                { label: "Destination", value: destination },
                { label: "Travelers", value: `${doc?.inputSnapshot?.adults ?? "—"} adults` },
                {
                  label: "Dates",
                  value: `${formatDate(doc?.inputSnapshot?.start_date)} – ${formatDate(doc?.inputSnapshot?.end_date)}`,
                },
                { label: "Budget", value: String(budget).toLowerCase() },
              ]}
            />

            {/* ── admin final price ── */}
            <section>
              <SectionHeading label="Admin Final Price (PKR)" />
              {editMode ? (
                <input
                  type="number"
                  min="1"
                  value={draftPrice}
                  onChange={(e) => setDraftPrice(e.target.value)}
                  placeholder="e.g. 250000"
                  className={inputCls}
                />
              ) : (
                <p className="text-[#0A1A44] font-semibold text-lg">
                  {doc.adminFinalPrice != null
                    ? `PKR ${Number(doc.adminFinalPrice).toLocaleString()}`
                    : <span className="text-gray-400 text-sm font-normal">Not set yet</span>}
                </p>
              )}
            </section>

            {/* ── admin-curated flights ── */}
            <section>
              <SectionHeading icon={<Plane size={18} className="text-teal-600" />} label="Selected Flights (Admin)" />
              {editMode ? (
                <div className="space-y-3">
                  {draftFlights.map((f, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="Airline *" value={f.airline}
                          onChange={(e) => updateFlight(i, "airline", e.target.value)} />
                        <input className={inputCls} placeholder="Price (PKR)" type="number" min="0" value={f.price}
                          onChange={(e) => updateFlight(i, "price", e.target.value)} />
                        <input className={inputCls} placeholder="Duration (e.g. 2h 30m)" value={f.duration}
                          onChange={(e) => updateFlight(i, "duration", e.target.value)} />
                        <input className={inputCls} placeholder="Stops" type="number" min="0" value={f.stops}
                          onChange={(e) => updateFlight(i, "stops", e.target.value)} />
                      </div>
                      <button onClick={() => removeFlight(i)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition">
                        <X size={12} /> Remove flight
                      </button>
                    </div>
                  ))}
                  <button onClick={addFlight}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition">
                    <Plus size={14} /> Add flight
                  </button>
                </div>
              ) : adminFlights.length > 0 ? (
                <div className="space-y-3">
                  {adminFlights.map((f, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="font-medium text-[#0A1A44]">
                        {f.airline ?? "Flight"} {f.price != null ? `• PKR ${Number(f.price).toLocaleString()}` : ""}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {f.duration ?? ""}
                        {f.stops != null ? ` • ${f.stops} stop${f.stops !== 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No admin-selected flights yet.</p>
              )}
            </section>

            {/* ── admin-curated hotels ── */}
            <section>
              <SectionHeading icon={<BedDouble size={18} className="text-teal-600" />} label="Selected Hotels (Admin)" />
              {editMode ? (
                <div className="space-y-3">
                  {draftHotels.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="Hotel name *" value={h.name}
                          onChange={(e) => updateHotel(i, "name", e.target.value)} />
                        <input className={inputCls} placeholder="Price/night (PKR)" type="number" min="0" value={h.price}
                          onChange={(e) => updateHotel(i, "price", e.target.value)} />
                      </div>
                      <button onClick={() => removeHotel(i)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition">
                        <X size={12} /> Remove hotel
                      </button>
                    </div>
                  ))}
                  <button onClick={addHotel}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition">
                    <Plus size={14} /> Add hotel
                  </button>
                </div>
              ) : adminHotels.length > 0 ? (
                <div className="space-y-3">
                  {adminHotels.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="font-medium text-[#0A1A44]">{h.name ?? "Hotel"}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {h.price != null ? `PKR ${Number(h.price).toLocaleString()}/night` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No admin-selected hotels yet.</p>
              )}
            </section>

            {/* ── save / cancel ── */}
            {editMode && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition"
                >
                  <Save size={14} />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ── AI snapshot flights (read-only reference) ── */}
            {snapshotFlights.length > 0 && (
              <section>
                <SectionHeading icon={<Plane size={18} className="text-gray-400" />} label="AI-Suggested Flights (Snapshot)" />
                <div className="space-y-3">
                  {snapshotFlights.map((f, i) => {
                    const price =
                      typeof f?.price === "object" && f?.price?.total
                        ? `${f.price.currency ?? "USD"} ${f.price.total}`
                        : f?.price ? String(f.price) : "—";
                    return (
                      <div key={f?.flightId ?? i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                        <p className="font-medium text-gray-600">{f?.airline ?? f?.carrier ?? "Flight"} • {price}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {f?.duration ? String(f.duration).replace(/^PT/, "") : ""}
                          {f?.stops != null ? ` • ${f.stops} stop${f.stops !== 1 ? "s" : ""}` : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── AI snapshot hotels (read-only reference) ── */}
            {snapshotHotels.length > 0 && (
              <section>
                <SectionHeading icon={<BedDouble size={18} className="text-gray-400" />} label="AI-Suggested Hotels (Snapshot)" />
                <div className="space-y-3">
                  {snapshotHotels.map((h, i) => {
                    const priceStr =
                      typeof h?.price === "object" && h?.price?.total
                        ? `${h.price.currency ?? "EUR"} ${h.price.total}/night`
                        : h?.price ? `${h.price}/night` : "—";
                    return (
                      <div key={h?.hotelId ?? i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                        <p className="font-medium text-gray-600">{h?.name ?? h?.hotelName ?? "—"}</p>
                        <p className="text-sm text-gray-400 mt-1">{priceStr}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── itinerary ── */}
            {itinerary.length > 0 && (
              <section>
                <SectionHeading label="Itinerary" />
                <ul className="space-y-3">
                  {itinerary.map((item, i) => (
                    <li key={i} className="p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                      <p className="text-teal-600 font-semibold mb-2">
                        Day {item?.day ?? i + 1}: {item?.title ?? "—"}
                      </p>
                      {Array.isArray(item?.activities) ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {item.activities.map((act, j) => <li key={j}>{act}</li>)}
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

            {/* ── POIs ── */}
            {pois.length > 0 && (
              <section>
                <SectionHeading icon={<MapPin size={18} className="text-teal-600" />} label="Points of Interest" />
                <div className="flex flex-wrap gap-2">
                  {pois.map((p, i) => (
                    <span key={p?.id ?? i}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium">
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
