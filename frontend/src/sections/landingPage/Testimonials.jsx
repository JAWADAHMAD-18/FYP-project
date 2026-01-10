import React from "react";
import { motion } from "framer-motion";
import TestimonialCard from "../../components/Cards/TestimonialCard";

const Testimonials = () => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      location: "Exploring Bali",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "The Pick & Go package saved me weeks of planning. Everything from the villa to the local guides was top-notch!",
      rating: 5,
    },
    {
      name: "Marc Thompson",
      location: "Adventure in Swiss Alps",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "The smart assistant really understood my vibe. It suggested a hidden hiking trail that wasn't on any blog. Remarkable.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      location: "Honeymoon in Amalfi",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "Premium service without the snobbery. They handled a last-minute flight cancellation before I even realized it happened.",
      rating: 5,
    },
  ];

  // 1. Container Variants (Handles the "Stagger" orchestrations)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between each card's animation
      },
    },
  };

  // 2. Card Variants (Matches the GSAP "back.out" feel)
  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.34, 1.56, 0.64, 1], // Beizer curve for that "springy" snap
      },
    },
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A1A44] mb-4">
              Stories from our global community
            </h2>
            <p className="text-gray-500">
              We've helped over 10,000+ travelers create memories that last a
              lifetime.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-full font-bold text-sm">
              4.9/5 Average Rating
            </div>
          </div>
        </div>

        {/* 3. Grid Wrapper (The Observer) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }} // Triggers when 15% of the grid is visible
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {reviews.map((review, index) => (
            <TestimonialCard
              key={index}
              {...review}
              variants={cardVariants} // Pass variants to the forwardRef motion component
              className="break-inside-avoid"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
