import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Route-level code splitting to avoid loading all pages on first paint
const App = lazy(() => import("./App.jsx"));
const ProtectedRoute = lazy(() => import("./routes/ProtectedRoute.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/LoginPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));

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
        path: "dashboard",
        element: <ProtectedRoute />, 
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
        ],
      },
      // You can add more protected routes here
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
      <Suspense fallback={<div className="min-h-screen" />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </StrictMode>
);
