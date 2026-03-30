import { motion } from "framer-motion";
import networkBg from "../../assets/network-bg.svg";

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
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#0A1A44] pt-20">
      {/* Network background - full section, low opacity */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden
      >
        <img
          src={networkBg}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6"
        >
          About TripFusion
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
