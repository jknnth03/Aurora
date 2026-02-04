import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import usePermission from "../hooks/usePermission";

type PermissionMode = "any" | "all" | "single";

interface PermissionRouteProps {
  // For single permission check
  requiredPermission?: string;

  // For multiple permission checks
  requiredPermissions?: string[];
  permissionMode?: PermissionMode;

  // Component to render
  element?: React.ReactNode;

  // Redirect path if unauthorized
  redirectTo?: string;

  // Optional: Show loading state while permissions are being loaded
  loadingComponent?: React.ReactNode;
}

/**
 * A route component that checks if the user has the required permission(s)
 * Uses the centralized usePermission hook for consistent permission checking
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  requiredPermission,
  requiredPermissions,
  permissionMode = "any",
  element,
  redirectTo = "/unauthorized",
  loadingComponent = null,
}) => {
  const location = useLocation();

  // Use the centralized permission hook
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  } = usePermission();

  // Show loading component if permissions are still loading
  if (userPermissions === undefined || userPermissions === null) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  // Determine if user has the required permissions
  let hasRequiredPermission = true;

  if (requiredPermission) {
    // Single permission check
    hasRequiredPermission = hasPermission(requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    // Multiple permissions check
    if (permissionMode === "any") {
      hasRequiredPermission = hasAnyPermission(requiredPermissions);
    } else if (permissionMode === "all") {
      hasRequiredPermission = hasAllPermissions(requiredPermissions);
    }
  }

  // If no permissions are specified, allow access (default behavior)
  if (
    !requiredPermission &&
    (!requiredPermissions || requiredPermissions.length === 0)
  ) {
    hasRequiredPermission = true;
  }

  if (!hasRequiredPermission) {
    // Redirect if user doesn't have permission
    console.log(location);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If there's a specific element provided, render it
  // Otherwise, render the child routes (Outlet)
  return element ? <>{element}</> : <Outlet />;
};

export default PermissionRoute;
