import Hero from "../sections/HeroSection/Hero";
import Services from "../sections/landingPage/Services";
import PackagesSection from "../sections/landingPage/Packages";
import TrustedBy from "../sections/landingPage/TrustedBy";
import Testimonials from "../sections/landingPage/Testimonials";
import StorySection from "../sections/landingPage/Stories";
import BlogSection from "../sections/landingPage/BlogSection";
import Footer from "../sections/footer/Footer";
function LandingPage() {
  return (
    <>
      <Hero />
      <PackagesSection />
      <TrustedBy />
      <Services />
      <Testimonials />
      <StorySection />
      <BlogSection/>
      <Footer />
    </>
  );
}
export default LandingPage;
