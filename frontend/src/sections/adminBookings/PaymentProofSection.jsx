import { useState } from "react";
import { Calendar, FileText } from "lucide-react";
import ImagePreviewModal from "../../components/admin/ImagePreviewModal";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentProofSection({ booking }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const imageUrl =
    booking?.payment_proof_url ?? booking?.paymentProof?.imageUrl ?? null;
  const note = booking?.payment_note ?? null;
  const uploadedAt =
    booking?.paymentProof?.uploadedAt ?? null;

  if (!imageUrl && !note) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-black text-[#0A1A44] mb-4">
          Payment Proof
        </h2>
        <p className="text-sm text-gray-500">No payment proof uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-black text-[#0A1A44] mb-4">
          Payment Proof
        </h2>

        {imageUrl && (
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Receipt / Screenshot
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="block w-full max-w-xs rounded-xl overflow-hidden border border-gray-100 hover:ring-2 hover:ring-teal-300 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <img
                src={imageUrl}
                alt="Payment proof"
                className="w-full h-40 object-cover"
              />
            </button>
            <p className="mt-1 text-xs text-gray-500">
              Click to zoom
            </p>
          </div>
        )}

        {note && (
          <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              <FileText size={14} />
              User Note
            </div>
            <p className="text-sm text-gray-700">{note}</p>
          </div>
        )}

        {uploadedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            Uploaded: {fmtDate(uploadedAt)}
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={previewOpen}
        imageUrl={imageUrl}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
