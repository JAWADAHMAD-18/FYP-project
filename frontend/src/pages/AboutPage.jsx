import { Suspense, lazy } from "react";

const AboutHero = lazy(() => import("../sections/about/AboutHero"));
const StatsSection = lazy(() => import("../sections/about/StatsSection"));
const StorySection = lazy(() => import("../sections/about/StorySection"));
const HowItWorks = lazy(() => import("../sections/about/HowItWorks"));
const FounderSection = lazy(() => import("../sections/about/FounderSection"));
const TechStack = lazy(() => import("../sections/about/TechStack"));
const VisionSection = lazy(() => import("../sections/about/VisionSection"));
const CTASection = lazy(() => import("../sections/about/CTASection"));

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <main>
        <AboutHero />
        <StatsSection />
        <StorySection />
        <HowItWorks />
        {/* <FounderSection /> */}
        <TechStack />
        <VisionSection />
        <CTASection />
      </main>
    </Suspense>
  );
}
