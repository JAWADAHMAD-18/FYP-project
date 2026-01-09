import ServiceCard from "../../components/Cards/ServiceCard";

const Services = () => {
  const serviceData = [
    {
      title: "Travel Made Easy — Pick & Go",
      description:
        "Choose from carefully crafted travel packages with transparent pricing. Book instantly and start planning with confidence.",
      variant: "blue",
    },
    {
      title: "Your Trip, Designed Around You",
      description:
        "Share your travel style and preferences. Our smart assistant helps shape your journey — you stay in control of the final plan.",
      variant: "teal",
    },
    {
      title: "Not Sure Where to Go? Let’s Explore",
      description:
        "Get thoughtful destination ideas and travel inspiration based on your interests, budget, and available time.",
      variant: "blue",
    },
    {
      title: "Flight Options, Simplified",
      description:
        "Discover popular flight routes for your destination and make informed decisions while planning your trip.",
      variant: "teal",
    },
    {
      title: "Stay Where Comfort Meets Style",
      description:
        "Browse top-rated hotels and accommodations — from comfortable stays to premium experiences.",
      variant: "blue",
    },
    {
      title: "Plan Smarter with Weather Insights",
      description:
        "Check current and upcoming weather conditions so you can pack right and travel stress-free.",
      variant: "teal",
    },
  ];

  return (
    <section className="py-20 bg-[#f4f6fb]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A1A44] text-center mb-14">
          Plan Your Trip with Confidence
        </h2>

        {/* Services Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {serviceData.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              variant={service.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
