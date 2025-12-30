import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Import images correctly - relative to src folder
import mountainImg from "../../../assets/images/mountain.jpg";
import beachImg from "../../../assets/images/beach.jpg";
import adventureImg from "../../../assets/images/adventure.jpg";
import historicalImg from "../../../assets/images/historical.jpg";
import cityImg from "../../../assets/images/city.jpg";

const images = [mountainImg, beachImg, adventureImg, historicalImg, cityImg];

export default function HeroBackground() {
  useGSAP(() => {
    const slides = gsap.utils.toArray(".bg-slide");

    // Start with only first slide visible
    gsap.set(slides, { autoAlpha: 0, scale: 1.1 });
    gsap.set(slides[0], { autoAlpha: 1, scale: 1 });

    const tl = gsap.timeline({ repeat: -1 });

    slides.forEach((slide, i) => {
      const nextSlide = slides[(i + 1) % slides.length];

      tl.to(slide, {
        duration: 2,
        scale: 1.05,
        ease: "power1.inOut",
      })

        // 🔥 Fade in next slide *before* this one fades out
        .to(
          nextSlide,
          {
            duration: 1.2,
            autoAlpha: 1,
            scale: 1,
            ease: "power3.out",
          },
          "-=0.6" // fade-in starts early → overlap → no white flash
        )

        // Fade this slide out AFTER next slide appears
        .to(slide, {
          duration: 1,
          autoAlpha: 0,
          scale: 1.1,
          ease: "power3.in",
        });
    });
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {images.map((src, i) => (
        <div
          key={i}
          className="bg-slide absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        ></div>
      ))}
    </div>
  );
}
