import { useState, useCallback } from "react";
import { MapPin, Calendar, Wallet, Users, Plane,ChevronDown } from "lucide-react";

const BUDGET_OPTIONS = [
  { value: "low", label: "Budget — Economical choices" },
  { value: "medium", label: "Standard — Best value" },
  { value: "high", label: "Premium — Luxury experience" },
];
const labelCls =
  "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2";
const TRAVEL_STYLES = [
  { value: "solo", label: "Solo", adults: 1 },
  { value: "couple", label: "Couple", adults: 2 },
  { value: "family", label: "Family", adults: 4 },
  { value: "group", label: "Group", adults: 6 },
];

const InputField = ({ id, label, icon: Icon, children, ...rest }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"
    >
      {Icon && <Icon size={14} className="text-teal-600" />}
      {label}
    </label>
    {children || (
      <input
        id={id}
        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
        {...rest}
      />
    )}
  </div>
);

const getTodayString = () => new Date().toISOString().split("T")[0];

const FormSection = ({ onSubmit, isLoading, isAuthenticated }) => {
  const [form, setForm] = useState({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    returnDate: "",
    budgetPreference: "medium",
    travelStyle: "solo",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOptionSelect = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const style = TRAVEL_STYLES.find((s) => s.value === form.travelStyle);
      onSubmit({
        originCity: form.originCity.trim(),
        destinationCity: form.destinationCity.trim(),
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        budgetPreference: form.budgetPreference,
        adults: style?.adults ?? 1,
      });
    },
    [form, onSubmit],
  );

  const isFormValid =
    form.originCity.trim() &&
    form.destinationCity.trim() &&
    form.departureDate &&
    form.returnDate &&
    form.departureDate < form.returnDate;

  return (
    <section className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
          <Plane size={14} />
          AI-Powered Trip Builder
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1A44] leading-tight">
          Craft Your <span className="text-teal-600">Perfect Trip</span>
        </h1>
        <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
          Tell us where you want to go and we&apos;ll create a personalised
          itinerary powered by AI, real-time flights, hotels and weather data.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-6 md:p-8 space-y-6"
      >
        {/* Cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            id="originCity"
            label="Origin City"
            icon={MapPin}
            name="originCity"
            placeholder="e.g. London"
            value={form.originCity}
            onChange={handleChange}
            required
            autoComplete="off"
          />
          <InputField
            id="destinationCity"
            label="Destination City"
            icon={MapPin}
            name="destinationCity"
            placeholder="e.g. Tokyo"
            value={form.destinationCity}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            id="departureDate"
            label="Departure Date"
            icon={Calendar}
            name="departureDate"
            type="date"
            min={getTodayString()}
            value={form.departureDate}
            onChange={handleChange}
            required
          />
          <InputField
            id="returnDate"
            label="Return Date"
            icon={Calendar}
            name="returnDate"
            type="date"
            min={form.departureDate || getTodayString()}
            value={form.returnDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="budgetPreference"
            className={labelCls + " flex items-center gap-1.5"}
          >
            <Wallet size={11} className="text-teal-500" />
            Budget Preference
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Choose a spending level that matches your comfort.
          </p>
          <div className="relative">
            <select
              id="budgetPreference"
              name="budgetPreference"
              value={form.budgetPreference}
              onChange={handleChange}
              className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-[#0A1A44] bg-white outline-none transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 hover:border-gray-300 cursor-pointer"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Travel Style */}
        <div>
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
            <Users size={14} className="text-teal-600" />
            Trip Type
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRAVEL_STYLES.map((opt) => {
              const active = form.travelStyle === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleOptionSelect("travelStyle", opt.value)}
                  className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                  <span className="block text-[11px] font-normal text-gray-400 mt-0.5">
                    {opt.adults} {opt.adults === 1 ? "adult" : "adults"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {!isAuthenticated && (
            <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm mb-4 text-center font-medium">
              🔒 Please log in to generate a custom package.
            </p>
          )}
          <button
            type="submit"
            disabled={!isFormValid || isLoading || !isAuthenticated}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                isFormValid && isAuthenticated
                  ? "linear-gradient(135deg, #0D9488, #0A1A44)"
                  : undefined,
              backgroundColor:
                !isFormValid || !isAuthenticated ? "#94a3b8" : undefined,
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate My Custom Package"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormSection;
