import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const StorySection = () => {
  const sectionRef = useRef();
  const triggerRef = useRef();

  useGSAP(() => {
    const pin = gsap.fromTo(
      sectionRef.current,
      { translateX: 0 },
      {
        translateX: "-200vw",
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=3000",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      }
    );
    return () => pin.kill();
  }, []);

  const stories = [
    {
      time: "Morning",
      title: "Fresh Start",
      desc: "Wake up to the cool mountain air. Enjoy a hot cup of local tea as the sun rises over the beautiful green peaks.",
      image:
        "/stories_images/morning.avif",
    },
    {
      time: "02:00 PM",
      title: "Hidden Echoes",
      desc: "Take a walk through the hidden streets. Meet friendly locals, visit historic buildings, and see the real culture of the place.",
      image:
        "/stories_images/afternoon.avif",
    },
    {
      time: "Evening",
      title: "Quiet Night",
      desc: "Relax by a warm bonfire as the day ends. Look up at a sky full of stars and enjoy a peaceful time with your loved ones.",
      image:
        "/stories_images/night.avif",
    },
  ];

  return (
    <div ref={triggerRef} className="overflow-hidden py-20">
      <div ref={sectionRef} className="flex flex-nowrap h-screen w-[300vw]">
        {stories.map((story, index) => (
          <div
            key={index}
            className="w-screen h-screen relative flex items-center justify-start px-10 md:px-32"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 100%), url(${story.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 max-w-2xl">
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
                  Keep scrolling
                </span>
                <div className="flex-1 h-[1px] bg-white/20"></div>
              </div>
            </div>

            {/* Simple Progress Indicator */}
            <div className="absolute bottom-10 left-10 md:left-32 flex gap-2">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full ${
                    i === index ? "bg-blue-500" : "bg-white/20"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorySection;
