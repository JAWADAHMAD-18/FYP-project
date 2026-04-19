import { motion } from "framer-motion";

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

/* ─── Broken Plane SVG ─── */
const BrokenPlaneIllustration = () => (
  <motion.div
    animate={{ rotate: [-3, 3, -3] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    className="relative select-none"
  >
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Plane with warning illustration"
    >
      {/* Dashed trail (broken) */}
      <path
        d="M20 110 Q50 95 70 100"
        stroke="#0D9488"
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <path
        d="M80 98 Q95 92 105 90"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />

      {/* Plane body */}
      <path
        d="M105 88 L148 68 L165 72 L148 82 Z"
        fill="#0D9488"
        stroke="#0D9488"
        strokeWidth="1"
      />
      {/* Fuselage */}
      <path
        d="M105 88 L70 98 L75 104 L105 88Z"
        fill="#0f766e"
      />
      {/* Tail wing upper */}
      <path
        d="M112 82 L115 68 L122 72 L115 84Z"
        fill="#14b8a6"
      />
      {/* Tail wing lower */}
      <path
        d="M112 90 L110 104 L118 102 L118 90Z"
        fill="#14b8a6"
      />

      {/* Smoke puffs around the plane */}
      <circle cx="98" cy="84" r="7" fill="#e2e8f0" fillOpacity="0.9" />
      <circle cx="92" cy="89" r="5" fill="#e2e8f0" fillOpacity="0.7" />
      <circle cx="88" cy="82" r="4" fill="#e2e8f0" fillOpacity="0.6" />
      <circle cx="82" cy="87" r="3.5" fill="#e2e8f0" fillOpacity="0.5" />

      {/* Warning badge */}
      <circle cx="155" cy="48" r="22" fill="#fef9c3" stroke="#fbbf24" strokeWidth="2.5" />
      {/* Warning triangle */}
      <path
        d="M155 36 L167 56 L143 56 Z"
        fill="#f59e0b"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="153" y="42" width="4" height="8" rx="2" fill="white" />
      <circle cx="155" cy="53" r="2" fill="white" />

      {/* Scattered dots (debris) */}
      <circle cx="45" cy="120" r="3" fill="#0D9488" fillOpacity="0.25" />
      <circle cx="35" cy="105" r="2" fill="#0D9488" fillOpacity="0.2" />
      <circle cx="60" cy="115" r="2.5" fill="#0D9488" fillOpacity="0.15" />
    </svg>
  </motion.div>
);

/* ─── ErrorPage Component ─── */
export default function ErrorPage({ message }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#f0fdfa] overflow-hidden px-4 py-16">

      {/* Background decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      {/* Brand */}
      <p className="absolute top-6 left-8 text-teal-600 font-extrabold text-xl tracking-tight">
        Trip<span className="text-slate-700">Fusion</span>
      </p>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* SVG illustration */}
        <motion.div variants={itemVariants} className="mb-6">
          <BrokenPlaneIllustration />
        </motion.div>

        {/* Error badge */}
        <motion.div variants={itemVariants} className="mb-3">
          <span className="inline-block bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Unexpected Error
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug mb-3"
        >
          Something went wrong mid-flight.
        </motion.h1>

        {/* Subtext / error message */}
        <motion.p
          variants={itemVariants}
          className="text-slate-500 text-base leading-relaxed max-w-md mb-10"
        >
          {message
            ? message
            : "An unexpected error occurred. Our team has been notified."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center"
        >
          {/* Reload */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(13,148,136,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-teal-200 text-sm sm:text-base"
          >
            {/* Refresh icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Reload Page
          </motion.button>

          {/* Go to Home — plain <a> tag (router context may be broken) */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm sm:text-base"
          >
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Go to Home
          </motion.a>
        </motion.div>

        {/* Subtle footer */}
        <motion.p
          variants={itemVariants}
          className="mt-10 text-slate-400 text-xs"
        >
          If this keeps happening, please contact{" "}
          <a href="mailto:support@tripfusion.com" className="underline hover:text-teal-600">
            support@tripfusion.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
