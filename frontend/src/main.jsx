import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { SupportChatProvider } from "./features/supportChat/context/SupportChatProvider.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Route-level code splitting to avoid loading all pages on first paint
const App = lazy(() => import("./App.jsx"));
const CustomPackagePage = lazy(() => import("./pages/CustomPackagePage.jsx"));
const ProtectedRoute = lazy(() => import("./routes/ProtectedRoute.jsx"));
const AdminProtectedRoute = lazy(
  () => import("./routes/AdminProtectedRoute.jsx"),
);
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/LoginPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const BookingDetail = lazy(() => import("./pages/dashboard/BookingDetail.jsx"));
const PackagesPage = lazy(() => import("./pages/packages/PackagesPage.jsx"));
const PackageDetailPage = lazy(
  () => import("./pages/packages/PackageDetailPage.jsx"),
);
const BookingPage = lazy(() => import("./pages/booking/BookingPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const AddPackagePage = lazy(() => import("./pages/AddPackage.jsx"));
const AdminCustomPackagePage = lazy(
  () => import("./pages/admin/AdminCustomPackagePage.jsx"),
);
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings.jsx"));
const AdminBookingDetail = lazy(
  () => import("./pages/admin/AdminBookingDetail.jsx"),
);
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App contains Navbar + Footer
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "packages",
        element: <PackagesPage />,
      },
      {
        path: "packages/:id",
        element: <PackageDetailPage />,
      },
      {
        path: "booking/:packageId",
        element: <BookingPage />,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "bookings/:id",
            element: <BookingDetail />,
          },
        ],
      },
      {
        path: "profile",
        element: <ProtectedRoute />,
        children: [
          {
            path: "settings",
            element: <ProfileSettings />,
          },
        ],
      },
      {
        path: "admin",
        element: <AdminProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "package/add-package",
            element: <AddPackagePage />,
          },
          {
            path: "package/:id",
            element: <AddPackagePage />,
          },
          {
            path: "custom-package/:requestId",
            element: <AdminCustomPackagePage />,
          },
          {
            path: "bookings",
            element: <AdminBookings />,
          },
          {
            path: "bookings/:id",
            element: <AdminBookingDetail />,
          },
        ],
      },
      // You can add more protected routes here
      {
        path: "custom-package",
        element: <CustomPackagePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },
  // Routes outside App layout → no navbar/footer
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AuthProvider>
          <SupportChatProvider>
            <Suspense fallback={<div className="min-h-screen" />}>
              <RouterProvider router={router} />
            </Suspense>
          </SupportChatProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
