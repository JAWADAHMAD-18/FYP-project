import { motion } from "framer-motion";

const Services = () => {
  const serviceData = [
    {
      title: "Travel Made Easy — Pick & Go",
      description:
        "Carefully crafted packages with transparent pricing. Book instantly.",
      variant: "bg-blue-600 text-white",
      gridClass: "lg:col-span-3 lg:row-span-1", // Large Card
      icon: "✈️",
    },
    {
      title: "Your Trip, Designed Around You",
      description:
        "Our smart assistant helps shape your journey — you stay in control.",
      variant: "bg-teal-500 text-white",
      gridClass: "lg:col-span-3 lg:row-span-1", // Large Card
      icon: "🗺️",
    },
    {
      title: "Not Sure Where to Go?",
      description: "Thoughtful ideas based on your budget and time.",
      variant: "bg-teal-50 border-l-4 border-teal-400 text-gray-800",
      gridClass: "lg:col-span-2",
      icon: "🌍",
    },
    {
      title: "Flight Options",
      description: "Discover popular routes and simplify your travel.",
      variant: "bg-teal-50 border-l-4 border-teal-400 text-gray-800",
      gridClass: "lg:col-span-2",
      icon: "🎫",
    },
    {
      title: "Stay in Style",
      description: "Top-rated hotels for every budget.",
      variant: "bg-teal-50 border-l-4 border-teal-400 text-gray-800",
      gridClass: "lg:col-span-2",
      icon: "🏨",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // This replaces GSAP stagger
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A1A44] mb-4">
            Plan Your Trip with Confidence
          </h2>
          <p className="text-gray-500 max-w-4xl text-lg mx-auto">
            Everything you need for a seamless journey, from inspiration to
            execution.
          </p>
        </div>

        {/* Dynamic Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // amount: 0.2 means trigger when 20% visible
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-6"
        >
          {serviceData.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`group p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${service.variant} ${service.gridClass}`}
            >
              <div>
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  {service.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-8">
                <button className="text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Learn More <span className="text-lg">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
