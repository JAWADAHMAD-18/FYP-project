import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

import Hero from "../sections/HeroSection/Hero";
import Services from "../sections/landingPage/Services";
import PackagesSection from "../sections/landingPage/Packages";
import TrustedBy from "../sections/landingPage/TrustedBy";
import Testimonials from "../sections/landingPage/Testimonials";
import StorySection from "../sections/landingPage/Stories";
import BlogSection from "../sections/landingPage/BlogSection";
import TripFusionLoader from "../components/Loader/TripFusionLoader.jsx"

function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <TripFusionLoader/>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <>
      <Hero />
      <PackagesSection />
      <TrustedBy />
      <Services />
      <Testimonials />
      <StorySection />
      <BlogSection />
    </>
  );
}

export default LandingPage;
