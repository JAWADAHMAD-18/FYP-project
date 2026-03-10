import { motion } from "framer-motion";
import {
  Globe,
  Server,
  Database,
  MessageCircle,
  Brain,
} from "lucide-react";

const tech = [
  { name: "React", icon: Globe },
  { name: "Node.js", icon: Server },
  { name: "MongoDB", icon: Database },
  { name: "Socket.IO", icon: MessageCircle },
  { name: "AI APIs", icon: Brain },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export default function TechStack() {
  return (
    <section className="py-10 md:py-18 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1A44] mb-4">
            Technology Stack
          </h2>
          <p className="text-gray-500 text-lg">
            Built with modern tools for a seamless experience
          </p>
          <div className="h-1 w-16 bg-teal-600 mx-auto mt-6" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {tech.map((t, index) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.08, y: -4 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-teal-100 transition-all duration-300 min-w-[120px]"
              >
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <span className="font-semibold text-[#0A1A44]">{t.name}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
