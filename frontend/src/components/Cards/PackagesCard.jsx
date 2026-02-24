import { MapPin, Clock, Users, Calendar, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PackageCard = ({ packageData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className="group max-w-sm transition-all duration-500 hover:-translate-y-2"
      style={{
        padding: "2px",
        borderRadius: "1rem",
        background:
          "linear-gradient(135deg, hsl(175 84% 32%), hsl(222 80% 15%))",
        boxShadow: "0 8px 24px -8px hsl(222 80% 15% / 0.12)",
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden flex flex-col h-full group-hover:shadow-[0_8px_32px_-8px_hsl(175_84%_32%/0.35)] transition-shadow duration-500">
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={packageData.image}
            alt={packageData.title}
            className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {packageData.available && (
            <span
              className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: "#0D9488" }}
            >
              ● Available
            </span>
          )}

          {/* Admin Controls – top-left overlay */}
          {user?.isAdmin && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/package/${packageData._id}`);
                }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm
                           hover:bg-teal-50 hover:text-teal-700 text-gray-600
                           transition-colors duration-200"
                title="Edit Package"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 flex flex-col flex-grow">
          {/* TYPE + LOCATION */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: "#1E3A5F" }}
            >
              {packageData.trip_type} Tour
            </span>

            <div
              className="flex items-center gap-1"
              style={{ color: "#0D9488" }}
            >
              <MapPin size={16} />
              <span className="text-sm font-semibold">
                {packageData.location}
              </span>
            </div>
          </div>

          {/* TITLE */}
          <h3
            className="text-2xl font-bold mb-2 transition-colors duration-300 group-hover:text-[hsl(175_84%_32%)]"
            style={{ color: "#0A1A44" }}
          >
            {packageData.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {packageData.description}
          </p>

          {/* INFO ROWS */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: "#0D9488" }} />
                <span>
                  {packageData.durationDays
                    ? `${packageData.durationDays}D / ${packageData.durationNights ?? 0}N`
                    : packageData.duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: "#0D9488" }} />
                <span>{packageData.available_slot} slots</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} />
              <span>
                {formatDate(packageData.start_date)} –{" "}
                {formatDate(packageData.end_date)}
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500 mb-1">Price per person</p>
              <p className="text-3xl font-bold" style={{ color: "#0D9488" }}>
                ${packageData.price}
              </p>
            </div>

            <button
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300"
              style={{
                backgroundColor: "#0A1A44",
              }}
              onClick={() => {
                if (packageData?._id) navigate(`/packages/${packageData._id}`);
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0D9488")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0A1A44")
              }
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
