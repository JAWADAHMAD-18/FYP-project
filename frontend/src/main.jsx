import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { SupportChatProvider } from "./features/supportChat/context/SupportChatProvider.jsx";
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
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));

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
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SupportChatProvider>
        <Suspense fallback={<div className="min-h-screen" />}>
          <RouterProvider router={router} />
        </Suspense>
      </SupportChatProvider>
    </AuthProvider>
  </StrictMode>,
);
