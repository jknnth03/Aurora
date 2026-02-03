// src/routes/private-route.tsx

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import PageLoad from "../components/layout/__loading/__loading";
import ProtectedLayout from "../components/layout/protected-layout/protected-layout";
import { CONFIG } from "../config/config";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "../features/slices/auth-slice";
import usePermission from "../hooks/usePermission";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { hasPathPermission } = usePermission();

  const location = useLocation();

  // const isAuthorized = permittedModulesFlat.some()

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loading = useSelector(selectAuthLoading);

  // If still loading, show loading state
  if (loading) {
    return <PageLoad />;
  }

  // if (isAuthenticated && !hasPathPermission(location.pathname)) {
  //   return (
  //     <Navigate
  //       to={"/unauthorized"}
  //       state={{ from: location }}
  //       replace={true}
  //     />
  //   );
  // }
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the current location for redirect after login
    return (
      <Navigate
        to={CONFIG.ROUTES.LOGIN.PATH}
        state={{ from: location }}
        replace={true}
      />
    );
  }

  // If authenticated, render the protected route content
  return <ProtectedLayout>{children}</ProtectedLayout>;
};
