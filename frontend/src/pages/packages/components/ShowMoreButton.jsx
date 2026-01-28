import { motion } from "framer-motion";

export default function ShowMoreButton({ onClick, disabled }) {
  return (
    <div className="flex justify-center mt-10">
      <motion.button
        whileHover={!disabled ? { y: -1 } : undefined}
        whileTap={!disabled ? { y: 0 } : undefined}
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#0A1A44] hover:bg-[#0D9488]"
        }`}
      >
        Show More
      </motion.button>
    </div>
  );
}

