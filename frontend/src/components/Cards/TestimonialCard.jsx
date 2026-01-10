import { Star } from "lucide-react";

const TestimonialCard = ({
  name,
  location,
  image,
  text,
  rating,
  className,
}) => {
  return (
    <div
      className={`testimonial-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <div className="flex gap-1">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      <p className="text-gray-600 italic leading-relaxed">"{text}"</p>

      <div className="flex items-center gap-3 mt-auto">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-50"
        />
        <div>
          <h4 className="font-bold text-[#0A1A44] text-sm">{name}</h4>
          <p className="text-xs text-blue-600 font-medium">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
