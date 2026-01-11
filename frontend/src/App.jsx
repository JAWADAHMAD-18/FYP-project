import { Outlet } from "react-router-dom";
import Navbar from "./components/header/navbar/Navbar.jsx";
import Footer from "./sections/footer/Footer.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
function App() {
   useEffect(() => {
    AOS.init({
      once: true,
      easing: "ease-out-cubic",
      duration: 700, 
    });
  }, []);
  return (
    <div>
      <Navbar />
      <Outlet /> 
      <Footer />
    </div>
  );
}

export default App;
