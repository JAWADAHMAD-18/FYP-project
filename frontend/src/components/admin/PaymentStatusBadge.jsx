const statusStyles = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  payment_submitted: "bg-blue-50 text-blue-700 border-blue-200",
  payment_verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NotPaid: "bg-amber-50 text-amber-700 border-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Refunded: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function PaymentStatusBadge({ status }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const label = String(status).replace(/_/g, " ");
  const style = statusStyles[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${style}`}
    >
      {label}
    </span>
  );
}
