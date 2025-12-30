import { Outlet } from "react-router-dom";
import Navbar from "./components/header/navbar/Navbar.jsx";
function App() {
  return (
    <div>
      <Navbar />
      <Outlet /> 
    </div>
  );
}

export default App;
