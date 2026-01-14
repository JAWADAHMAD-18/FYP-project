import { motion } from "framer-motion";
import { Plane } from "lucide-react";

const TripFusionLoader = ({ message = "Fusing your perfect trip..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* The Outer Animated Ring (The Orbit) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-t-4 border-b-4 border-teal-600/20 border-l-4 border-l-teal-600"
        />

        {/* The Pulsing Plane Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute flex items-center justify-center bg-teal-50 text-teal-600 w-12 h-12 rounded-2xl shadow-lg shadow-teal-600/10"
        >
          <Plane size={24} fill="currentColor" />
        </motion.div>

        {/* The "Path" Dots */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              transform: `rotate(${i * 120}deg) translateY(-50px)`,
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          {message}
        </h2>
        <div className="flex gap-1 justify-center mt-2">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
              className="w-1.5 h-1.5 bg-teal-600 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TripFusionLoader;
