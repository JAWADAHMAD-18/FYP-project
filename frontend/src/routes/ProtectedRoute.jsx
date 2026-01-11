import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Jab tak refresh-token / auth check ho rahi hai
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // Agar user login nahi
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Agar login hai → allow route
  return <Outlet />;
};

export default ProtectedRoute;
