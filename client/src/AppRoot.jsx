import { StrictMode, useState, useEffect, useRef } from "react";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppLoader from "./components/common/AppLoader.jsx";

const AppRoot = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasMounted = useRef(false);

  useEffect(() => {
    // Mark as mounted
    hasMounted.current = true;

    // Simple approach - hide loader quickly
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 200); // Very short timeout

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until loader is hidden
  if (isInitialLoad) {
    return <AppLoader />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
};

export default AppRoot;
