const PackageSkeleton = () => {
  return (
    <div className="max-w-sm w-full rounded-xl overflow-hidden bg-gray-200 animate-pulse shadow-md">
      {/* Image placeholder */}
      <div className="h-56 w-full bg-gray-300"></div>

      {/* Content placeholder */}
      <div className="p-6 flex flex-col gap-3">
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>

        {/* Description */}
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded"></div>

        {/* Info row */}
        <div className="flex justify-between gap-2 mt-2">
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PackageSkeleton;
