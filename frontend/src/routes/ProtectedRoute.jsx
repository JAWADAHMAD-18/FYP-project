import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait for the refresh-token / session restore flow to finish
  // before making ANY redirect decision — avoids premature navigation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // Not authenticated → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin users must not access user-only routes.
  // Redirect them to their own dashboard (works on fresh login AND page refresh).
  if (user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Authenticated regular user → allow through
  return <Outlet />;
};

export default ProtectedRoute;
