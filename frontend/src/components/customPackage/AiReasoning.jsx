import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const AiReasoning = memo(function AiReasoning({ reasoning }) {
  const [open, setOpen] = useState(false);
  if (!reasoning) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-5">
      <button
        className="w-full flex items-center justify-between gap-2 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-base font-bold text-[#0A1A44] border-l-4 border-teal-600 pl-3">
          <Sparkles size={18} className="text-teal-600" />
          AI Reasoning Summary
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="reasoning"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3">
              {reasoning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AiReasoning;
