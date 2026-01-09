import React from "react";

const TrustedBy = () => {
  // Replace these with your actual logo images or SVG icons
  const partners = [
    { name: "Expedia", id: 1 },
    { name: "TripAdvisor", id: 2 },
    { name: "Airbnb", id: 3 },
    { name: "Booking.com", id: 4 },
    { name: "Hilton", id: 5 },
    { name: "Marriott", id: 6 },
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
          Trusted by the World's Leading Travel Brands
        </h2>
      </div>

      {/* Marquee Wrapper */}
      <div className="flex w-full overflow-hidden select-none [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex flex-nowrap shrink-0 items-center gap-16 animate-infinite-scroll hover:[animation-play-state:paused] cursor-pointer">
          {/* First set of logos */}
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <span className="text-2xl font-bold text-gray-800 px-4">
                {partner.name}
              </span>
              {/* Replace <span> with <img src={...} /> for real logos */}
            </div>
          ))}

          {/* Second set (duplicate) for seamless loop */}
          {partners.map((partner) => (
            <div
              key={`dup-${partner.id}`}
              className="flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <span className="text-2xl font-bold text-gray-800 px-4">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
