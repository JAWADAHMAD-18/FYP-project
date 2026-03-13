import {
  Calendar,
  Users,
  MapPin,
  BadgeDollarSign,
  FileText,
} from "lucide-react";
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

function fmtPrice(n, currency = "USD") {
  return Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  });
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
      <Icon size={14} className="text-teal-600" />
      {label}
    </div>
    <div className="mt-2 text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

export default function BookingInfoSection({ booking }) {
  const paymentStatus =
    booking?.payment_status ??
    (booking?.paymentStatus === "Paid" ? "payment_verified" : null) ??
    "pending_payment";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <h2 className="text-base font-black text-[#0A1A44]">
          Booking Information
        </h2>
        <BookingStatusBadge status={booking?.bookingStatus} />
        <PaymentStatusBadge status={paymentStatus} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoRow
          icon={MapPin}
          label="Destination"
          value={
            booking?.packageSnapshot?.destination ??
            booking?.package?.location ??
            "—"
          }
        />
        <InfoRow
          icon={Calendar}
          label="Travel Date"
          value={fmtDate(booking?.travelDate)}
        />
        <InfoRow
          icon={Users}
          label="Travelers"
          value={String(booking?.numPeople ?? 1)}
        />
        <InfoRow
          icon={BadgeDollarSign}
          label="Price per Person"
          value={fmtPrice(booking?.pricePerPerson, booking?.currency)}
        />
        <InfoRow
          icon={BadgeDollarSign}
          label="Total Price"
          value={fmtPrice(booking?.totalPrice, booking?.currency)}
        />
        <InfoRow
          icon={FileText}
          label="Booking Code"
          value={booking?.bookingCode ?? "—"}
        />
      </div>

      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Booking ID
        </p>
        <p className="mt-1 font-mono text-sm text-gray-800 break-all">
          {booking?._id}
        </p>
      </div>

      {booking?.user && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            User
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {booking.user.name ?? "—"}
          </p>
          <p className="text-sm text-gray-600">{booking.user.email ?? ""}</p>
        </div>
      )}

      {booking?.notes && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Notes
          </p>
          <p className="mt-1 text-sm text-gray-700">{booking.notes}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Booked: {fmtDate(booking?.bookingDate ?? booking?.createdAt)}
      </div>
    </div>
  );
}
