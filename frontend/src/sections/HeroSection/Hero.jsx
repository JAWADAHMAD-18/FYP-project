import React from "react";
import HeroBackground from "../HeroSection/HeroBG";

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      <HeroBackground />

      <div className="absolute inset-0 bg-black/20 z-[5]" />

      <div className="relative z-[10] h-full flex flex-col justify-center items-start px-10 md:px-20">
        <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl">
          Discover Your Next Adventure
        </h1>

        <p className="mt-4 text-white/90 text-lg md:text-xl max-w-xl drop-shadow-lg">
          Explore mountains, beaches, cities, and everything in between with
          TripFusion.
        </p>

        <button className="mt-8 px-8 py-3 bg-[#4A90E2] text-white font-semibold rounded-full text-lg hover:bg-[#3a7ccc] transition-all shadow-lg">
          Explore Now
        </button>
      </div>
    </section>
  );
}
