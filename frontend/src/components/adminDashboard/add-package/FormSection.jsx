import { memo } from "react";


const FormSection = ({ title, subtitle, children, className = "" }) => {
  return (
    <section
      className={`bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="pb-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-5">{children}</div>
    </section>
  );
};

export default memo(FormSection);
