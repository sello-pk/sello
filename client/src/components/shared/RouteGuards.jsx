import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetMeQuery, useGetMyAuctionAccessStatusQuery } from "../../redux/services/api";
import { canAccessMenu } from "../../utils/roleAccess";
import { useMemo } from "react";
import { clearAuthSession, isAuthenticated } from "../../utils/tokenManager";

/**
 * Protected Route Component
 * Ensures user is authenticated
 */
const ProtectedRoute = ({ children }) => {
  const authed = isAuthenticated();
  const {
    data: user,
    isLoading,
    isError,
  } = useGetMeQuery(undefined, {
    skip: !authed,
  });

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state - don't redirect while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

/**
 * Admin Route Component
 * Ensures user is authenticated and has admin role
 */
const AdminRoute = () => {
  const authed = isAuthenticated();
  const location = useLocation();
  const {
    data: currentUser,
    isLoading,
    isError,
    error,
  } = useGetMeQuery(undefined, {
    skip: !authed,
  });

  const outletKey = useMemo(() => {
    return `${location.pathname}${location.search}${location.hash}`;
  }, [location.pathname, location.search, location.hash]);

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state - don't redirect while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle errors - check if it's a network error or auth error
  if (isError) {
    console.error("AdminRoute - Error fetching user", error);

    // Network error: don't trust stale local user data for admin route access.
    if (
      error?.status === "FETCH_ERROR" ||
      error?.data?.message?.includes("Failed to fetch") ||
      error?.data?.error?.includes("Failed to fetch")
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-red-500 mb-2">Couldn't load. Check your connection and try again.</p>
            <p className="text-gray-600 text-sm">
              Please check your connection and try again
            </p>
          </div>
        </div>
      );
    } else if (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.originalStatus === 401 ||
      error?.originalStatus === 403
    ) {
      // For auth errors (401, 403), clear session and redirect
      clearAuthSession();
      return <Navigate to="/login" replace />;
    } else {
      clearAuthSession();
      return <Navigate to="/login" replace />;
    }
  }

  // Check if user data exists
  if (!currentUser) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin or team member with admin role
  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Check if user has access to the current route based on their role
  const currentPath = location.pathname;

  // Allow dashboard for all admins
  if (currentPath === "/admin/dashboard") {
    return <Outlet key={outletKey} />;
  }

  // Check role-based access for other routes
  if (!canAccessMenu(currentUser, currentPath)) {
    // Redirect to dashboard if user doesn't have access
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet key={outletKey} />;
};

/**
 * Auction Capability Route
 * Restricts routes to users with approved auction access.
 */
const AuctionCapabilityRoute = () => {
  const authed = isAuthenticated();
  const { data: user, isLoading: userLoading, isError: userError } = useGetMeQuery(
    undefined,
    { skip: !authed },
  );
  const {
    data: auctionAccess,
    isLoading: accessLoading,
    isError: accessError,
  } = useGetMyAuctionAccessStatusQuery(undefined, {
    skip: !authed || !user,
  });

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (userLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  // Do not forcibly log out on auction-access lookup errors.
  if (accessError) {
    if (user.role === "admin" || (user.role === "dealer" && user?.dealerInfo?.verified)) {
      return <Outlet />;
    }
    return <Navigate to="/profile?section=auction-access" replace />;
  }

  if (user.role === "admin") {
    return <Outlet />;
  }

  const bidderStatus =
    auctionAccess?.auctionCapabilities?.auctionBidder?.status || "not_requested";
  const dealerStatus =
    auctionAccess?.auctionCapabilities?.auctionDealer?.status || "not_requested";
  const hasAccess =
    bidderStatus === "approved" ||
    dealerStatus === "approved" ||
    (user.role === "dealer" && user?.dealerInfo?.verified);

  if (!hasAccess) {
    return <Navigate to="/profile?section=auction-access" replace />;
  }

  return <Outlet />;
};

/**
 * Dealer Route Component
 * Ensures user is authenticated, is a dealer, and is verified.
 */
const DealerRoute = () => {
  const authed = isAuthenticated();
  const { data: user, isLoading, isError } = useGetMeQuery(undefined, { skip: !authed });

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "dealer") {
    return <Navigate to="/" replace />;
  }

  if (!user.dealerInfo?.verified) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <Outlet />;
};

// Re-export both names unchanged for backward compatibility
export { ProtectedRoute, AdminRoute, AuctionCapabilityRoute, DealerRoute };
export default ProtectedRoute;
