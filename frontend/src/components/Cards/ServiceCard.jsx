const ServiceCard = ({ title, description, variant = "blue" }) => {
  const variants = {
    blue: "bg-gradient-to-br from-[#0A1A44] to-[#1f3c88]",
    teal: "bg-gradient-to-br from-teal-700 to-teal-400",
  };

  return (
    <div
      className={`
        ${variants[variant]}
        text-white
        p-7
        rounded-2xl
        min-h-[190px]
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
        cursor-pointer
      `}
    >
      <h3 className="text-lg font-semibold leading-snug mb-2">{title}</h3>

      <p className="text-sm leading-relaxed text-white/90">{description}</p>
    </div>
  );
};

export default ServiceCard;
