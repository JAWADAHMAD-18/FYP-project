import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const containerRef = useRef();

  const posts = [
    {
      title: "5 Hidden Gems You Must Visit in Northern Pakistan",
      category: "Destination",
      date: "Jan 10, 2026",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "How to Pack Light for Your Next International Trip",
      category: "Tips",
      date: "Jan 05, 2026",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Traditional Flavors: A Guide to Local Food in Turkey",
      category: "Food",
      date: "Dec 28, 2025",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1532339142463-fd0a89b22415?auto=format&fit=crop&w=600&q=80",
    },
  ];

  useGSAP(
    () => {
      gsap.from(".blog-card", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 bg-[#f4f6fb]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A1A44] mb-4 tracking-tight">
              Travel Stories & Advice
            </h2>
            <p className="text-gray-500">
              Get expert tips and inspiration from our travel writers to plan
              your next great adventure.
            </p>
          </div>
          <button className="bg-white text-[#0A1A44] px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all border border-gray-100">
            View All Stories
          </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <div
              key={index}
              className="blog-card group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="h-64 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">
                  <span>{post.date}</span>
                  <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0A1A44] leading-snug group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm">
                  Read More{" "}
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
