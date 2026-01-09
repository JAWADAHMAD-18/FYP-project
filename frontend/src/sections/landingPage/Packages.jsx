import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // for routing
import PackageCard from "./../../components/Cards/PackagesCard.jsx";
import PackageSkeleton from "../../components/Loader/PackageSkeleton.jsx";
import { getPackages } from "../../services/package.service.js";

const PackagesSection = () => {
  const [allPackages, setAllPackages] = useState([]);
  const [visiblePackages, setVisiblePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // default empty string

  const INITIAL_LOAD = 6; // show 6 initially

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getPackages();
        setAllPackages(data);
        setVisiblePackages(data.slice(0, INITIAL_LOAD));
      } catch (err) {
        // if err.message undefined, fallback to safe message
        setError(err?.message || "Something went wrong while loading packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <section className="bg-[#F8FAFF] py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-inter text-4xl font-bold text-[#0A1A44]">Your Next Adventure Awaits</h2>
          <p className="text-gray-600 mt-3 text-lg font-inter">
            Curated journeys Crafted for comfort, budget, and unforgettable experiences
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(INITIAL_LOAD)].map((_, i) => (
              <PackageSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Packages Grid */}
        {!loading && !error && (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePackages.map((pkg) => (
                <PackageCard key={pkg._id || pkg.title} packageData={pkg} />
              ))}
            </div>

            {/* Show More Button */}
            {allPackages.length > INITIAL_LOAD && (
              <div className="flex justify-center mt-10">
                <Link
                //   to="/packages" //TODO future route
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-[#0A1A44] hover:bg-[#0D9488] transition-colors duration-300"
                >
                  Show More
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PackagesSection;
