//TODO: in future we will get these ratings from database when we have it in place
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TestimonialCard from "../../components/Cards/TestimonialCard";

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
  const scrollRef = useRef();

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
    // Add more as needed...
  ];

  useGSAP(
    () => {
      gsap.from(".testimonial-card", {
        opacity: 0,
        scale: 0.8,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: scrollRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: scrollRef }
  );

  return (
    <section ref={scrollRef} className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
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

        {/* Optimized Grid Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <TestimonialCard
              key={index}
              {...review}
              className="break-inside-avoid" // Prevents card from splitting across columns
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
