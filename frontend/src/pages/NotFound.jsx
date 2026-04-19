import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ─── Compass SVG with floating animation ─── */
const CompassIllustration = () => (
  <motion.div
    animate={{ y: [0, -14, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="relative select-none"
  >
    {/* Drop shadow glow */}
    <div className="absolute inset-0 flex items-end justify-center">
      <div className="w-32 h-6 bg-teal-600/20 rounded-full blur-xl mt-4" />
    </div>
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Compass illustration"
    >
      {/* Outer ring */}
      <circle cx="90" cy="90" r="80" stroke="#0D9488" strokeWidth="4" fill="#f0fdfa" />
      <circle cx="90" cy="90" r="72" stroke="#99f6e4" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />

      {/* Cardinal tick marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const inner = angle % 90 === 0 ? 60 : 65;
        const outer = 72;
        return (
          <line
            key={angle}
            x1={90 + inner * Math.sin(rad)}
            y1={90 - inner * Math.cos(rad)}
            x2={90 + outer * Math.sin(rad)}
            y2={90 - outer * Math.cos(rad)}
            stroke={angle % 90 === 0 ? "#0D9488" : "#99f6e4"}
            strokeWidth={angle % 90 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Cardinal letters */}
      <text x="90" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0D9488">N</text>
      <text x="90" y="161" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">S</text>
      <text x="158" y="95" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">E</text>
      <text x="22" y="95" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">W</text>

      {/* Compass needle — tilted, "lost" position */}
      {/* North arrow (teal) */}
      <polygon points="90,40 85,90 90,82 95,90" fill="#0D9488" />
      {/* South arrow (slate) */}
      <polygon points="90,140 85,90 90,98 95,90" fill="#94a3b8" />

      {/* Center dot */}
      <circle cx="90" cy="90" r="7" fill="#0D9488" />
      <circle cx="90" cy="90" r="3.5" fill="white" />

      {/* Question mark badge */}
      <circle cx="140" cy="46" r="18" fill="#0D9488" />
      <text x="140" y="52" textAnchor="middle" fontSize="20" fontWeight="900" fill="white">?</text>
    </svg>
  </motion.div>
);

/* ─── Decorative background dots ─── */
const FloatingDot = ({ cx, cy, r, delay }) => (
  <motion.circle
    cx={cx} cy={cy} r={r}
    fill="#0D9488"
    fillOpacity={0.08}
    animate={{ cy: [cy, cy - 12, cy] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#f0fdfa] overflow-hidden px-4 py-16">

      {/* Decorative background SVG blobs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <FloatingDot cx="10%" cy="20%" r="80" delay={0} />
        <FloatingDot cx="85%" cy="15%" r="60" delay={1} />
        <FloatingDot cx="70%" cy="80%" r="100" delay={2} />
        <FloatingDot cx="5%"  cy="75%" r="50"  delay={0.5} />
        <FloatingDot cx="95%" cy="55%" r="40"  delay={1.5} />
      </svg>

      {/* Top brand strip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 left-8 text-teal-600 font-extrabold text-xl tracking-tight"
      >
        Trip<span className="text-slate-700">Fusion</span>
      </motion.p>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-xl w-full"
      >
        {/* 404 label */}
        <motion.div variants={itemVariants} className="mb-2">
          <span className="inline-block text-[6.5rem] sm:text-[8rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-teal-700 select-none">
            404
          </span>
        </motion.div>

        {/* Compass SVG */}
        <motion.div variants={itemVariants} className="mb-8">
          <CompassIllustration />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug mb-3"
        >
          Looks like you've gone off the map.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-10"
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on your journey.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center"
        >
          {/* Primary */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(13,148,136,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-teal-200 text-sm sm:text-base"
          >
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Back to Home
          </motion.button>

          {/* Secondary */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/packages")}
            className="inline-flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm sm:text-base"
          >
            {/* Globe icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Explore Packages
          </motion.button>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          variants={itemVariants}
          className="mt-10 text-slate-400 text-xs"
        >
          Lost? Our support team is always ready to help.
        </motion.p>
      </motion.div>
    </div>
  );
}
