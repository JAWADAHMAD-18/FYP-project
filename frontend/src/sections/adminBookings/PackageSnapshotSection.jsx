export default function PackageSnapshotSection({ booking }) {
  const snap = booking?.packageSnapshot;
  const images = snap?.images ?? [];
  const includes = snap?.includes ?? [];
  const excludes = snap?.excludes ?? [];

  if (!snap) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-black text-[#0A1A44] mb-5">
        Package Snapshot
      </h2>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Title
        </p>
        <p className="mt-1 text-base font-semibold text-gray-900">
          {snap.title ?? "—"}
        </p>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Destination
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {snap.destination ?? "—"}
        </p>
      </div>

      {images.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Images
          </p>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-20 h-20 rounded-xl overflow-hidden border border-gray-100 hover:ring-2 hover:ring-teal-300 transition"
              >
                <img
                  src={url}
                  alt={`Package ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Includes
          </p>
          {includes.length > 0 ? (
            <ul className="space-y-1 text-sm text-gray-700">
              {includes.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-teal-600 font-black">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Excludes
          </p>
          {excludes.length > 0 ? (
            <ul className="space-y-1 text-sm text-gray-700">
              {excludes.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-500 font-black">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
