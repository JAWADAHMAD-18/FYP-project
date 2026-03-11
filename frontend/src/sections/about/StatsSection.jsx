import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Package,
  MapPin,
  Headset,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    icon: Package,
    value: 755,
    suffix: "+",
    label: "Travel Packages Generated",
  },
  {
    icon: MapPin,
    value: 50,
    suffix: "+",
    label: "Destinations Covered",
  },
  {
    icon: Headset,
    value: 24,
    suffix: "/7",
    label: "Real-Time Support",
  },
  {
    icon: Sparkles,
    value: null,
    suffix: "",
    label: "AI Powered Planning",
  },
];

function AnimatedStat({ value, suffix, isInView }) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || value === null) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  if (value === null) {
    return <span className="text-4xl sm:text-5xl font-black">AI</span>;
  }

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-10 md:py-18 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-teal-100 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 text-teal-600 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A1A44] mb-2">
                  <AnimatedStat
                    value={stat.value}
                    suffix={stat.suffix}
                    isInView={isInView}
                  />
                </div>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
