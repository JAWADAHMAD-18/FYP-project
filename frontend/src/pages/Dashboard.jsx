import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "../sections/Dashboard/DashboardHeader";
import UpcomingTrips from "../sections/Dashboard/Booking";
import DiscoverySection from "../sections/Dashboard/DiscoverySection";
import TravelInsights from "../sections/Dashboard/Summary";
import SavingsToast from "../components/dashboard/SavingsToasts";

function Dashboard() {
  const location = useLocation();

  // Read savings passed from BookingPage via router state.
  // Use useState initialiser so we only read location.state once on mount.
  const [toastSavings] = useState(
    () => location.state?.newBookingSavings ?? null,
  );
  const [showToast, setShowToast] = useState(() => {
    const val = location.state?.newBookingSavings;
    return typeof val === "number" && val > 0;
  });

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
    // Clear router state so toast doesn't re-appear on refresh
    window.history.replaceState({}, document.title);
  }, []);

  return (
    <>
      {showToast && toastSavings > 0 && (
        <SavingsToast savings={toastSavings} onClose={handleCloseToast} />
      )}
      <DashboardHeader />
      <UpcomingTrips />
      <DiscoverySection />
      <TravelInsights />
    </>
  );
}

export default Dashboard;
