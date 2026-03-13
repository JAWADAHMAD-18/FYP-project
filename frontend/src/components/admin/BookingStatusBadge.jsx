const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function BookingStatusBadge({ status }) {
  const style = statusStyles[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}
    >
      {status ?? "—"}
    </span>
  );
}
