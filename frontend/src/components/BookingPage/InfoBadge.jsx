function InfoBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
      <span className="mt-0.5 text-teal-600 flex-shrink-0">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[#0A1A44] break-words leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

export default InfoBadge;