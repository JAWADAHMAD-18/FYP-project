import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import BookingStatusBadge from "../../components/admin/BookingStatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPrice(n) {
  return Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const TypeBadge = ({ type }) => {
  const isCustom = type === "custom";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
        isCustom
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-teal-50 text-teal-700 border-teal-200"
      }`}
    >
      {isCustom ? "Custom" : "Predefined"}
    </span>
  );
};

export default function BookingsTable({ bookings }) {
  const paymentStatus = (b) =>
    b.payment_status ?? (b.paymentStatus === "Paid" ? "payment_verified" : b.payment_status) ?? "pending_payment";

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Desktop table */}
      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Booking Code
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Package
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Type
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              User
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Travel Date
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Payment
            </th>
            <th className="text-left py-4 px-5 font-semibold text-gray-700">
              Status
            </th>
            <th className="text-right py-4 px-5 font-semibold text-gray-700">
              Total
            </th>
            <th className="text-right py-4 px-5 font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b._id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition"
            >
              <td className="py-4 px-5 font-mono text-xs text-gray-800">
                {b.bookingCode ?? "—"}
              </td>
              <td className="py-4 px-5 text-gray-700">
                {b.packageSnapshot?.title ?? b.package?.title ?? "—"}
              </td>
              <td className="py-4 px-5">
                <TypeBadge type={b.bookingType || "predefined"} />
              </td>
              <td className="py-4 px-5 text-gray-700">
                {b.user?.name ?? "—"}
              </td>
              <td className="py-4 px-5 text-gray-600">
                {fmtDate(b.travelDate)}
              </td>
              <td className="py-4 px-5">
                <PaymentStatusBadge status={paymentStatus(b)} />
              </td>
              <td className="py-4 px-5">
                <BookingStatusBadge status={b.bookingStatus} />
              </td>
              <td className="py-4 px-5 text-right font-semibold text-teal-700">
                {fmtPrice(b.totalPrice)}
              </td>
              <td className="py-4 px-5 text-right">
                <Link
                  to={`/admin/bookings/${b._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
                >
                  <ExternalLink size={14} />
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {bookings.map((b) => (
          <div key={b._id} className="p-5">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-600">
                  {b.bookingCode ?? "—"}
                </span>
                <TypeBadge type={b.bookingType || "predefined"} />
              </div>
              <Link
                to={`/admin/bookings/${b._id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600"
              >
                View Details
                <ExternalLink size={14} />
              </Link>
            </div>
            <p className="font-semibold text-gray-900 mb-1">
              {b.packageSnapshot?.title ?? b.package?.title ?? "—"}
            </p>
            <p className="text-sm text-gray-500 mb-2">{b.user?.name ?? "—"}</p>
            <div className="flex flex-wrap gap-2">
              <PaymentStatusBadge status={paymentStatus(b)} />
              <BookingStatusBadge status={b.bookingStatus} />
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">
                Travel: {fmtDate(b.travelDate)}
              </span>
              <span className="font-semibold text-teal-700">
                {fmtPrice(b.totalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
