import DashboardHeader from "../sections/Dashboard/DashboardHeader";
import UpcomingTrips from "../sections/Dashboard/Booking";
import DiscoverySection from "../sections/Dashboard/DiscoverySection";
import TravelInsights from "../sections/Dashboard/Summary";
import Sidebar from "../sections/Dashboard/Sidebar";
function Dashboard(){
    return(
        <>
        <DashboardHeader />
        <UpcomingTrips />
        <DiscoverySection />
        <TravelInsights />
        {/* <Sidebar /> */}
        </>
    )
}
export default Dashboard