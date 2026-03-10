import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section className="py-10 md:py-18 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1A44] mb-6">
            Our Story
          </h2>
          <div className="h-1 w-16 bg-teal-600 mx-auto mb-10" />
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              We built AI Travel Agency because planning a trip was often
              frustrating—endless tabs, conflicting prices, and generic
              itineraries. We wanted a platform that{" "}
              <strong className="text-[#0A1A44]">understands your preferences</strong>,{" "}
              <strong className="text-[#0A1A44]">generates tailored packages in seconds</strong>,
              and connects you with experts when you need guidance.
            </p>
            <p>
              By combining artificial intelligence with real human support, we
              deliver a seamless experience: from inspiration to booking, all in
              one place.{" "}
              <strong className="text-[#0A1A44]">Smarter planning. Less hassle. More adventure.</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
