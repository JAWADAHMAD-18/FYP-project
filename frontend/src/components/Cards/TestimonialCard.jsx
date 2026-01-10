import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { forwardRef } from "react";

// Using forwardRef allows Framer Motion to track this component properly
const TestimonialCard = forwardRef(
  (
    {
      name,
      location,
      image,
      text,
      rating,
      className,
      variants, // This allows the parent to pass down the animation
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        variants={variants}
        className={`testimonial-card bg-white p-6 rounded-2xl shadow-sm border border-gray-300 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300 ${className}`}
        // Optional: Add a little pop on hover directly here
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <div className="flex gap-1">
          {[...Array(rating)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        <p className="text-gray-600 italic leading-relaxed">"{text}"</p>

        <div className="flex items-center gap-3 mt-auto">
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-50"
          />
          <div>
            <h4 className="font-bold text-[#0A1A44] text-sm">{name}</h4>
            <p className="text-xs text-blue-600 font-medium">{location}</p>
          </div>
        </div>
      </motion.div>
    );
  }
);

// Setting a display name for debugging
TestimonialCard.displayName = "TestimonialCard";

export default TestimonialCard;
