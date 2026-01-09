import React from "react";
import "./TrustedBy.css"; // CSS file for marquee animation

const TrustedBy = () => {
  const partners = [
    { name: "Expedia", file: "expedia.svg", id: 1 },
    { name: "TripAdvisor", file: "trip.svg", id: 2 },
    { name: "Airbnb", file: "airbnb.svg", id: 3 },
    { name: "Booking.com", file: "booking.svg", id: 4 },
    { name: "Hilton", file: "hilton.svg", id: 5 },
    { name: "Marriott", file: "marriot.svg", id: 6 },
  ];

  return (
    <section className="py-10 bg-white overflow-hidden">
      {/* Section Heading */}
      <div className="container mx-auto px-4 mb-8 text-center">
        <h2 className="text-md font-semibold tracking-widest text-[#0A1A44] uppercase">
          Trusted by the World's Leading Travel Brands
        </h2>
      </div>

      {/* Marquee Wrapper */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-10 marquee">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center transition-transform duration-300 hover:scale-105"
            >
              <img
                src={`/logos/${partner.file}`}
                alt={partner.name}
                className="h-24 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
