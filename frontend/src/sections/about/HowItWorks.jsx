import { motion } from "framer-motion";
import {
  ClipboardList,
  Sparkles,
  MessageCircle,
  Plane,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Enter travel preferences",
    description:
      "Share your budget, dates, and interests. Our platform captures what matters to you.",
  },
  {
    icon: Sparkles,
    title: "AI generates a personalized package",
    description:
      "Our AI crafts a custom itinerary with flights, hotels, and activities—tailored to you.",
  },
  {
    icon: MessageCircle,
    title: "Confirm with a travel expert through chat",
    description:
      "Review and refine your plan with a real expert via real-time chat before you book.",
  },
  {
    icon: Plane,
    title: "Finalize your journey",
    description:
      "Once you're satisfied, complete the booking and get ready for your adventure.",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowItWorks() {
  return (
    <section className="py-10 md:py-18 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1A44] mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            From idea to itinerary in four simple steps
          </p>
          <div className="h-1 w-16 bg-teal-600 mx-auto mt-6" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.03, y: -6 }}
                className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-teal-50 text-teal-600 mb-5 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-teal-600 mb-2">
                  Step {index + 1}
                </p>
                <h3 className="text-xl font-bold text-[#0A1A44] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
