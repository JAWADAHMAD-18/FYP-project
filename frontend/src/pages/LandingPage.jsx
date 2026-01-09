import Hero from "../sections/HeroSection/Hero";
import Services from "../sections/landingPage/Services";
import PackagesSection from "../sections/landingPage/Packages";
import TrustedBy from "../sections/landingPage/TrustedBy";

function LandingPage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <PackagesSection />
      <Services />
    </>
  );
}
export default LandingPage;
