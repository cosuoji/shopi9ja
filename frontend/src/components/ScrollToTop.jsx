import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Access the current path (e.g., /glossary, /shipping)
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly jump to the top-left corner of the window
    window.scrollTo(0, 0);
  }, [pathname]); // This triggers every time the URL path changes

  return null; // This component doesn't render anything visually
};

export default ScrollToTop;
