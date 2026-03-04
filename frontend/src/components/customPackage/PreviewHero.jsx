import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const PreviewHero = ({ destinationImage, destinationName }) => {
  const imageUrl = destinationImage?.imageUrl ?? destinationImage?.url;
  const photographer =
    destinationImage?.photographer ??
    destinationImage?.photographerName ??
    destinationImage?.user?.name;

  if (!imageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-md"
    >
      <img
        src={imageUrl}
        alt={`${destinationName || "Destination"} – travel destination`}
        loading="lazy"
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A44]/80 via-[#0A1A44]/30 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-extrabold text-white leading-tight"
        >
          {destinationName || "Your Destination"}
        </motion.h2>

        {photographer && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-white/70 text-xs flex items-center gap-1.5"
          >
            <Camera size={12} />
            Photo by {photographer}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default PreviewHero;
