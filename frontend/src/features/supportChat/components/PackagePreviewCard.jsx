import { memo, useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, ExternalLink, X } from "lucide-react";

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

function resolveDestinationName(dest) {
  if (!dest) return "—";
  if (typeof dest === "string") return dest;
  if (typeof dest?.name === "string") return dest.name;
  return "—";
}

function PackagePreviewCard({
  packageData,
  side = "left",
  onReply,
  onViewDetails,
  onAccept,
  onReject,
  createdAt,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!packageData || typeof packageData !== "object") {
    return (
      <div className="px-4 mb-3">
        <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
          Invalid package data
        </div>
      </div>
    );
  }

  const requestId = packageData?.requestId;
  const destination = resolveDestinationName(packageData?.destination);
  const startDate = formatDate(packageData?.start_date);
  const endDate = formatDate(packageData?.end_date);
  const adults = packageData?.adults ?? packageData?.travelers ?? "—";
  const inputSnapshot = packageData?.inputSnapshot ?? {};
  const budget =
    inputSnapshot?.budgetPreference ?? inputSnapshot?.budget ?? "—";
  const notes = inputSnapshot?.notes ?? inputSnapshot?.additionalNotes ?? "";

  const isRight = side === "right";

  return (
    <div
      className={`flex px-4 mb-3 ${isRight ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[95%] w-full rounded-2xl border shadow-sm overflow-hidden ${
          isRight
            ? "bg-teal-600/10 border-teal-600/30"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-teal-600">
            Package confirmation request
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A1A44] transition"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 py-3 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">Destination</p>
                <p className="font-semibold text-[#0A1A44]">{destination}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Travelers</p>
                <p className="font-semibold text-[#0A1A44]">
                  {adults} {Number(adults) === 1 ? "adult" : "adults"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Departure</p>
                <p className="font-medium text-[#0A1A44]">{startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Return</p>
                <p className="font-medium text-[#0A1A44]">{endDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Budget</p>
                <p className="font-medium text-[#0A1A44] capitalize">
                  {String(budget).toLowerCase()}
                </p>
              </div>
            </div>
            {notes ? (
              <div>
                <p className="text-xs text-gray-500 font-medium">Notes</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50/50">
          {onViewDetails && requestId && (
            <button
              type="button"
              onClick={() => onViewDetails(requestId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Package
            </button>
          )}
          {onAccept && requestId && (
            <button
              type="button"
              onClick={() => onAccept(requestId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Accept
            </button>
          )}
          {onReject && requestId && (
            <button
              type="button"
              onClick={() => onReject(requestId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition"
            >
              Reject
            </button>
          )}
          {onReply && (
            <button
              type="button"
              onClick={onReply}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 transition"
          >
            <X className="w-3.5 h-3.5" />
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {createdAt && (
          <div className="px-4 pb-2 text-[11px] text-gray-400">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PackagePreviewCard);
