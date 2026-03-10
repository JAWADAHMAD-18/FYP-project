import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function VisionSection() {
  return (
    <section className="py-10 md:py-18 bg-gradient-to-br from-[#0A1A44] to-teal-900">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-8">
            <Compass className="w-8 h-8 text-teal-300" strokeWidth={2} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Our Vision
          </h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            To make travel planning easier for everyone through{" "}
            <strong className="text-teal-200">AI-driven automation</strong> and{" "}
            <strong className="text-teal-200">personalized recommendations</strong>.
            We aim to reduce the friction between dreaming about a trip and
            actually taking it—so you spend less time planning and more time
            exploring.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
