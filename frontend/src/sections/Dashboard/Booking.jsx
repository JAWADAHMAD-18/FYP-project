import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Map, Calendar, Plus, ExternalLink, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { getUpcomingBookings } from "../../services/booking.service.js";
import TripFusionLoader from "../../components/Loader/TripFusionLoader.jsx";

const UpcomingTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const bookings = await getUpcomingBookings();
      setTrips(bookings);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const hasTrips = trips && trips.length > 0;

  if (loading) {
    return (
      <TripFusionLoader/>
    );
  }

  return (
    <section className="px-6 md:px-12 py-5 bg-gray-100/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Upcoming Journeys
            </h2>
            <p className="text-gray-500 mt-1 font-medium">
              Manage your active fusions and travel documents.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#0d9488" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-teal-600/20"
          >
            <Plus size={20} />
            Explore New Packages
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {hasTrips ? (
            trips.map((trip, index) => (
              <motion.div
                key={trip._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Trip Image */}
                  <div className="relative w-full lg:w-64 h-44 rounded-2xl overflow-hidden shadow-inner bg-gray-100/50">
                    <img
                      src={
                        trip.packageSnapshot?.images?.[0] ||
                        "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000"
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={trip.packageSnapshot?.title || "Trip Image"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-1">
                      <Map size={14} />{" "}
                      {trip.packageSnapshot?.destination || "Destination"}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                            trip.bookingStatus === "Confirmed"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : trip.bookingStatus === "Pending"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {trip.bookingStatus || "Pending"}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">
                          {trip.packageSnapshot?.title || "Trip Booking"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                          Travelers:{" "}
                          <span className="text-gray-700 font-bold">
                            {trip.numPeople || 1}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 font-medium">
                          Total Investment
                        </p>
                        <p className="text-xl font-black text-teal-600">
                          ${trip.totalPrice?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <span>Preparation</span>
                        <span>
                          {trip.bookingStatus === "Confirmed" ? "80%" : "65%"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width:
                              trip.bookingStatus === "Confirmed" ? "80%" : "65%",
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-teal-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-gray-500 font-medium">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-teal-500" />
                        {fmtDate(trip.start_date)} - {fmtDate(trip.end_date)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full lg:w-auto flex flex-col gap-3">
                    <button className="flex items-center justify-center gap-2 w-full lg:min-w-[200px] py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-md active:scale-95">
                      <Ticket size={18} /> View Tickets
                    </button>
                    <Link
                      to={`/dashboard/bookings/${trip._id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:border-teal-600 hover:text-teal-600 transition-all active:scale-95"
                    >
                      <ExternalLink size={18} /> View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-50/50 border-2 border-dashed border-gray-200 rounded-[3rem] py-16 flex flex-col items-center justify-center text-center px-6"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-blue-500/5 flex items-center justify-center border border-gray-50">
                  <Plane className="text-teal-500 rotate-12" size={40} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full border-4 border-white"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                Your world is waiting.
              </h3>
              <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed font-medium">
                You haven't booked any fusions yet. Let's find a destination
                that matches your vibe.
              </p>
              <button className="group bg-teal-600 text-white px-12 py-5 rounded-2xl font-bold shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all flex items-center gap-3 active:scale-95">
                Find Your First Fusion
                <Plus className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;
