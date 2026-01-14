import { motion } from "framer-motion";
import { Heart, ArrowRight, Settings, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import TripFusionLoader from "../../components/Loader/TripFusionLoader"

const UserJourney = () => {
  const { user, loading } = useAuth();

  const [favoritePackages, setFavoritePackages] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const hasFavorites = user?.favorites?.length > 0;

  useEffect(() => {
    const fetchFavoritePackages = async () => {
      if (!user || !hasFavorites) return;

      try {
        setLoadingFavorites(true);

        const requests = user.favorites.map((packageId) =>
          fetch(`/packages/${packageId}`).then((res) => res.json())
        );

        const packages = await Promise.all(requests);
        setFavoritePackages(packages);
      } catch (error) {
        console.error("Error fetching favorite packages:", error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavoritePackages();
  }, [user]);

  if (loading) {
    return (
      <TripFusionLoader/>
    );
  }

  return (
    <section className="px-6 md:px-12 pt-24 pb-20 bg-gray-100/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-gray-200">
              <div className="relative">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-gray-200"
                />
                {user.isAdmin && (
                  <div className="absolute -top-2 -right-2 bg-teal-500 text-white p-1 rounded-full shadow-lg">
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 leading-tight">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <button className="ml-auto p-2 text-gray-400 hover:text-teal-600 transition-colors">
                <Settings size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-100/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Favorites
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.favorites.length}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-100/50/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <p className="text-sm font-bold text-teal-600 uppercase">
                  Explorer
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Your Saved Fusions
              </h2>
              <button className="text-sm font-semibold text-teal-600 flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight size={16} />
              </button>
            </div>

            {loadingFavorites ? (
              <p className="text-gray-400">Loading favorites...</p>
            ) : favoritePackages.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {favoritePackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="min-w-[280px] group cursor-pointer"
                  >
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
                      <img
                        src={pkg.images?.[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full">
                        <Heart
                          size={18}
                          fill="currentColor"
                          className="text-red-500"
                        />
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {pkg.title}
                    </h4>

                    <p className="text-sm text-gray-500 italic">
                      {pkg.duration} • ${pkg.price}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                <Heart size={32} className="mb-2 opacity-20" />
                <p className="text-sm">
                  No favorites saved yet. Start exploring!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UserJourney;
