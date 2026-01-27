import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { Suspense, lazy } from "react";

// Defer loading of heavy, below-the-fold sections
const Hero = lazy(() => import("../sections/HeroSection/Hero"));
const Services = lazy(() => import("../sections/landingPage/Services"));
const PackagesSection = lazy(() => import("../sections/landingPage/Packages"));
const TrustedBy = lazy(() => import("../sections/landingPage/TrustedBy"));
const Testimonials = lazy(
  () => import("../sections/landingPage/Testimonials")
);
const StorySection = lazy(() => import("../sections/landingPage/Stories"));
const BlogSection = lazy(() => import("../sections/landingPage/BlogSection"));

function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Hero />
      <PackagesSection />
      <TrustedBy />
      <Services />
      <Testimonials />
      <StorySection />
      <BlogSection />
    </Suspense>
  );
}

export default LandingPage;
