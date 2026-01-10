import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const StorySection = () => {
  const targetRef = useRef(null);
  
  // 1. Scroll Progress track karne ke liye hook
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // 2. Vertical scroll ko Horizontal movement mein transform karein
  // 0% scroll par 0 movement hogi, 100% scroll par -200vw move hoga
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-200vw"]);

  const stories = [
    {
      time: "Morning",
      title: "Fresh Start",
      desc: "Wake up to the cool mountain air. Enjoy a hot cup of local tea as the sun rises over the beautiful green peaks.",
      image: "/stories_images/morning.avif",
    },
    {
      time: "02:00 PM",
      title: "Hidden Echoes",
      desc: "Take a walk through the hidden streets. Meet friendly locals, visit historic buildings, and see the real culture of the place.",
      image: "/stories_images/afternoon.avif",
    },
    {
      time: "Evening",
      title: "Quiet Night",
      desc: "Relax by a warm bonfire as the day ends. Look up at a sky full of stars and enjoy a peaceful time with your loved ones.",
      image: "/stories_images/night.avif",
    },
  ];

  return (
    // Outer container: Iski height '300vh' rakhi hai taake scroll space mile
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      
      {/* Sticky wrapper: Yeh screen par ruk jayega (Pinning ka alternative) */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Moving Container: Yeh horizontal move karega */}
        <motion.div style={{ x }} className="flex">
          {stories.map((story, index) => (
            <div
              key={index}
              className="relative h-screen w-screen flex-shrink-0 flex items-center justify-start px-10 md:px-32"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 100%), url(${story.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="max-w-2xl">
                <p className="text-blue-400 font-bold uppercase tracking-widest mb-2">
                  {story.time}
                </p>

                <h2 className="text-6xl md:text-8xl font-black text-white leading-tight mb-6">
                  {story.title}
                </h2>

                <div className="w-16 h-1 bg-blue-500 mb-6"></div>

                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-medium">
                  {story.desc}
                </p>

                <div className="mt-10 flex items-center gap-4 text-white/40">
                  <span className="text-xs uppercase tracking-widest">
                    {index === stories.length - 1 ? "End of Stories" : "Keep scrolling"}
                  </span>
                  <div className="flex-1 h-[1px] bg-white/20"></div>
                </div>
              </div>

              {/* Progress dots inside the sticky view */}
              <div className="absolute bottom-10 left-10 md:left-32 flex gap-2">
                {stories.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                      i === index ? "bg-blue-500" : "bg-white/20"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StorySection;