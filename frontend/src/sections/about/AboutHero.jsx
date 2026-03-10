import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AboutHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A1A44] via-teal-900/80 to-blue-900 pt-20">
      {/* Subtle world map background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        aria-hidden
      >
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M150 80 Q200 60 250 90 L280 100 Q320 85 350 95 L400 90 Q450 100 500 95 L550 100 Q600 85 650 90 L700 95 Q750 85 780 100 L800 120 L800 350 L0 350 L0 100 Q50 80 100 95 L150 80 Z M120 150 Q180 130 250 155 L300 160 Q350 145 400 155 Q450 165 500 155 L600 160 Q680 140 720 170 L750 200 Q700 220 650 210 L500 205 Q400 200 300 205 L150 210 Q100 200 80 180 Z M200 250 Q280 230 400 245 Q520 260 600 245 L700 260 Q750 250 780 270 L800 280 L800 350 L0 350 L0 270 Q80 250 150 265 L200 250 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-white"
          />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/40 via-transparent to-blue-900/60" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6"
        >
          About AI Travel Agency
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          We simplify travel planning using artificial intelligence. Our platform
          generates personalized packages, connects you with experts in real-time,
          and turns your dream trip into reality—faster and smarter.
        </motion.p>
      </div>
    </section>
  );
}
