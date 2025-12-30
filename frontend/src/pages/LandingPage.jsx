import Navbar from "../components/header/navbar/Navbar";
import Hero from "../sections/HeroSection/Hero";
import Services from "../sections/landingPage/Services";
import PackagesSection from "../sections/landingPage/Packages";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <PackagesSection />
    </>
  );
}
export default LandingPage;
