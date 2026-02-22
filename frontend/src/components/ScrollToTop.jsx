import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  const scrollHistory = useRef({});

  const isPop = useRef(false);

  useEffect(() => {
    // Listen for popstate so we know *before* the location updates
    const handlePopState = () => {
      isPop.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isPop.current) {
      // Back / forward navigation → restore saved position (if any)
      const saved = scrollHistory.current[pathname] ?? 0;
      // Defer so the page has time to render its content first
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "instant" });
      });
    } else {
      // Save the current scroll position for the page we are *leaving*
      scrollHistory.current[pathname] = window.scrollY;

      // Forward navigation → smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Reset the pop flag after handling
    isPop.current = false;
  }, [pathname]);

  // This component renders nothing
  return null;
};

export default ScrollToTop;
