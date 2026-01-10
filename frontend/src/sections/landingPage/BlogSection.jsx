import React from "react";
import { motion } from "framer-motion";

const BlogSection = () => {
  const posts = [
    {
      title: "Chasing Sunsets: The Most Photogenic Spots in Cappadocia",
      category: "Photography",
      date: "Jan 10, 2026",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Solitude in the Sky: A Hiker's Guide to the Karakoram",
      category: "Adventure",
      date: "Jan 08, 2026",
      readTime: "10 min read",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Beyond Sushi: Discovering Tokyo’s Hidden Ramen Alleys",
      category: "Culinary",
      date: "Jan 05, 2026",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A1A44] mb-4 tracking-tight">
              Inspiring Your Next Journey
            </h2>
            <p className="text-gray-500 text-lg">
              Stories, tips, and guides from our global network of explorers to
              help you navigate the world with ease.
            </p>
          </div>
          <button className="bg-white text-[#0A1A44] px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            View All Stories
          </button>
        </div>

        {/* Blog Grid using Framer Motion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {posts.map((post, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Container */}
              <div className="h-72 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm text-[#0A1A44] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em]">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4 font-bold uppercase tracking-widest">
                  <span>{post.date}</span>
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full"></span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A1A44] leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  {post.title}
                </h3>

                <div className="mt-8 flex items-center gap-2 text-blue-600 font-extrabold text-sm group/btn">
                  <span>Read Article</span>
                  <motion.span
                    className="text-xl"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
