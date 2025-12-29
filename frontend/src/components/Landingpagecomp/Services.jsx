import ServiceCard from "../Cards/ServiceCard";

const Services = () => {
  return (
    <section className="py-20 bg-[#f4f6fb]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-[#0A1A44] text-center mb-12">
          What You Can Do
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            title="Book Ready-Made Packages"
            description="Choose company-approved travel packages with fixed pricing and instant booking."
            variant="blue"
          />

          <ServiceCard
            title="Build Custom Package (AI)"
            description="Create your own travel plan using AI and confirm final pricing through admin chat."
            variant="teal"
          />

          <ServiceCard
            title="AI Travel Assistant"
            description="Get smart travel suggestions, destination ideas, and guided planning support."
            variant="blue"
          />

          <ServiceCard
            title="Flight Information"
            description="Explore available and popular flights related to your selected destination."
            variant="teal"
          />

          <ServiceCard
            title="Hotel Discovery"
            description="Browse recommended and famous hotels to include in your travel plan."
            variant="blue"
          />

          <ServiceCard
            title="Weather Insights"
            description="Check real-time and upcoming weather to plan your trip better."
            variant="teal"
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
