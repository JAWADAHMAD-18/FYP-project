import React from "react";

const TrustedBy = () => {
  const partners = [
    { name: "Expedia", file: "expedia.svg", id: 1 },
    { name: "TripAdvisor", file: "trip.svg", id: 2 },
    { name: "Airbnb", file: "airbnb.svg", id: 3 },
    { name: "Booking.com", file: "booking.svg", id: 4 },
    { name: "Hilton", file: "hilton.svg", id: 5 },
    { name: "Marriott", file: "marriot.svg", id: 6 },
  ];

  // Duplicate the array so the second set seamlessly follows the first
  const allPartners = [...partners, ...partners];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 20s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="py-10 bg-white overflow-hidden">
        {/* Heading */}
        <div className="container mx-auto px-4 mb-8 text-center">
          <h2 className="font-inter text-lg font-bold tracking-widest text-[#0A1A44] uppercase">
            Trusted by the World's Leading Travel Brands
          </h2>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10
                          bg-gradient-to-r from-white to-transparent"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10
                          bg-gradient-to-l from-white to-transparent"
          />

          <div
            className="flex gap-10 marquee-track"
            style={{ width: "max-content" }}
          >
            {allPartners.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex items-center justify-center flex-shrink-0
                           transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={`/logos/${partner.file}`}
                  alt={partner.name}
                  className="h-10 w-auto sm:h-14 md:h-20 lg:h-24"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TrustedBy;
