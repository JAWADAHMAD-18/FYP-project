import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import PackageCard from "../../components/Cards/PackagesCard.jsx";
import PackageSkeleton from "../../components/Loader/PackageSkeleton.jsx";
import api from "../../api/Api.js";
import { getPackages } from "../../services/package.service.js";

const DiscoverySection = () => {
  const { user } = useAuth(); // ✅ Get logged-in user directly
  const [favorites, setFavorites] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const INITIAL_LOAD = 3; // Show 3 recommended packages

  useEffect(() => {
    const fetchFavoritesAndRecommendations = async () => {
      setLoading(true);

      try {
        // --- FETCH FAVORITES ---
        let favPackages = [];
        if (user?.favorites?.length > 0) {
          favPackages = await Promise.all(
            user.favorites.map(async (id) => {
              const res = await api.get(`/packages/${id}`);
              return res.data.package; // Make sure backend sends package under "package"
            })
          );
        }
        setFavorites(favPackages);

        // --- FETCH RECOMMENDED PACKAGES ---
        const allPackages = await getPackages(); // Use your existing service
        // Remove any packages that are already in favorites
        const filtered = allPackages.filter(
          (pkg) => !user?.favorites?.includes(pkg._id)
        );
        // Pick first 3 (or shuffled if you want random)
        setRecommended(filtered.slice(0, INITIAL_LOAD));
      } catch (err) {
        console.error("Error fetching favorites or recommended packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritesAndRecommendations();
  }, [user]);

  const displayData = favorites.length > 0 ? favorites : recommended;

  return (
    <section className="px-6 md:px-12 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {favorites.length > 0
                ? "Your Saved Fusions"
                : "Recommended for You"}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {favorites.length > 0
                ? "Destinations that caught your heart."
                : "We think you'll love these handpicked adventures."}
            </p>
          </div>
          <Link
            to="/packages"
            className="hidden md:flex items-center gap-2 text-teal-600 font-bold hover:gap-3 transition-all"
          >
            Explore More
          </Link>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(INITIAL_LOAD)].map((_, i) => (
              <PackageSkeleton key={i} />
            ))}
          </div>
        ) : displayData.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayData.map((pkg) => (
              <PackageCard key={pkg._id || pkg.title} packageData={pkg} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Nothing to show yet.
            </h3>
            <p className="text-gray-500 max-w-sm mb-8 font-medium">
              {favorites.length === 0
                ? "You haven't saved any favorites yet. Start exploring destinations you love!"
                : "No recommendations available at the moment."}
            </p>
            <Link
              to="/packages"
              className="bg-teal-600 text-white px-12 py-5 rounded-2xl font-bold shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all flex items-center gap-3 active:scale-95"
            >
              Explore Packages
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscoverySection;
