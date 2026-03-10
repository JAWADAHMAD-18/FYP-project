import { motion } from "framer-motion";
import { Linkedin, Github } from "lucide-react";
import jawadAhmad from "../../assets/jawadAhmad.png";

export default function FounderSection() {
  return (
    <section className="py-10 md:py-18 bg-gray-50">
      <div className="max-w-8xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1A44] mb-4">
            Meet the Founder
          </h2>
          <div className="h-1 w-16 bg-teal-600 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="max-w-xl mx-auto p-8 rounded-3xl bg-white border border-gray-100 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-33 h-46 rounded-2xl  flex justify-center items-centertext-white  font-black shadow-lg">
                <img src={jawadAhmad} alt="founder pic" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-[#0A1A44]">Jawad Ahmad</h3>
              <p className="text-teal-600 font-semibold mb-3">
                Founder & Full Stack Developer
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">
                Building intelligent travel platforms that combine AI automation
                with modern web technologies. Focused on making travel planning
                simpler, faster, and more personalized for everyone.
              </p>
              <div className="flex justify-center sm:justify-start gap-4 mt-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
