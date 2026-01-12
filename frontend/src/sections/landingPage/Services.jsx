import React from "react";
import { motion } from "framer-motion";
import { Plane, Map, Compass, Ticket, Hotel, ArrowRight } from "lucide-react";

const Services = () => {
  const serviceData = [
    {
      title: "Pick & Go Packages",
      description:
        "Carefully crafted travel plans with transparent pricing. Ready when you are.",
      variant: "bg-[#0A1A44] text-white shadow-blue-900/20",
      gridClass: "lg:col-span-3 lg:row-span-1",
      icon: <Plane className="w-8 h-8 text-blue-400" />,
      btnColor: "text-blue-400",
    },
    {
      title: "Custom Journeys",
      description:
        "Our smart assistant shapes the trip around your interests while you stay in control.",
      variant: "bg-teal-600 text-white shadow-teal-900/20",
      gridClass: "lg:col-span-3 lg:row-span-1",
      icon: <Map className="w-8 h-8 text-teal-200" />,
      btnColor: "text-teal-200",
    },
    {
      title: "Smart Recommendations",
      description:
        "Thoughtful travel ideas based on your budget and preferred time.",
      variant: "bg-white text-gray-800 border-gray-100",
      gridClass: "lg:col-span-2",
      icon: <Compass className="w-8 h-8 text-blue-600" />,
      btnColor: "text-blue-600",
    },
    {
      title: "Simplified Flights",
      description:
        "We find the most popular and efficient routes to simplify your travel.",
      variant: "bg-white text-gray-800 border-gray-100",
      gridClass: "lg:col-span-2",
      icon: <Ticket className="w-8 h-8 text-blue-600" />,
      btnColor: "text-blue-600",
    },
    {
      title: "Luxury Stays",
      description:
        "Hand-picked hotels and villas that prioritize style, comfort, and service.",
      variant: "bg-white text-gray-800 border-gray-100",
      gridClass: "lg:col-span-2",
      icon: <Hotel className="w-8 h-8 text-blue-600" />,
      btnColor: "text-blue-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-10 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A1A44] mb-4">
              Premium Services <br />
              <span className="text-blue-600">Tailored for You</span>
            </h2>
            <p className="text-gray-500 text-lg">
              We don't just book trips; we curate experiences that linger in
              your memory long after you return home.
            </p>
          </div>
          <div className="hidden md:block h-1 w-24 bg-blue-600 mb-4"></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8"
        >
          {serviceData.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`group p-10 rounded-[3rem] border flex flex-col justify-between transition-all duration-500 ${service.variant} ${service.gridClass}`}
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gray-50/10 flex items-center justify-center mb-5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>

                {/* Fixed the "Chota Data" issue with better font sizing and tracking */}
                <h3 className="text-lg md:text-xl font-extrabold mb-4 tracking-tight leading-tight">
                  {service.title}
                </h3>
                <p className="text-base md:text-lg opacity-80 leading-relaxed font-medium tracking-wide">
                  {service.description}
                </p>
              </div>

              <div className="mt-12">
                <button
                  className={`flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] ${
                    service.btnColor || "text-blue-600"
                  }`}
                >
                  Learn More{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-2 transition-transform duration-300"
                  />
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
