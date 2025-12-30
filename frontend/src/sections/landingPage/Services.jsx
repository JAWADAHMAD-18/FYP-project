import ServiceCard from "../../components/Cards/ServiceCard";

const Services = () => {
  const serviceData = [
    {
      title: "Ready-made trips? Book them instantly!",
      description:
        "Pick from our popular travel packages & start your adventure today.",
      variant: "blue",
      // icon: <PackageIcon />
    },
    {
      title: "Let AI craft your dream trip!",
      description:
        "Choose your style & preferences, and our AI will plan it for you. Confirm final details via chat.",
      variant: "teal",
      // icon: <RobotIcon />
    },
    {
      title: "Need ideas? AI’s got your back!",
      description:
        "Unsure where to go? Our AI assistant gives smart suggestions & travel tips.",
      variant: "blue",
      // icon: <RobotIcon />
    },
    {
      title: "Peek at flights & plan like a pro!",
      description:
        "See popular flights for your destination and plan your trip smartly.",
      variant: "teal",
      // icon: <FlightIcon />
      // icon: <PlaneIcon />
    },
    {
      title: "Find the coolest hotels for your stay",
      description:
        "Explore top-rated hotels & plan your perfect accommodation.",
      variant: "blue",
      // icon: <HotelIcon />
    },
    {
      title: "Weather check before you go!",
      description:
        "Sunny, rainy, or snowy—know the weather in advance & pack smart.",
      variant: "teal",
      // icon: <CloudIcon />
    },
  ];

  return (
    <section className="py-20 bg-[#f4f6fb]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1A44] text-center mb-14">
          Plan Your Adventure Your Way
        </h2>

        {/* Cards grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {serviceData.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              variant={service.variant}
              // icon={service.icon} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
