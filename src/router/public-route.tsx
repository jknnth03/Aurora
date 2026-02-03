// src/routes/public-route.tsx

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from "../features/slices/auth-slice";
import { CONFIG } from "../config/config";
import AuroraSpinner from "../components/ui/aurora-spinner/aurora-spinner";
import Box from "@mui/material/Box";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();
  if (loading) {
    return (
      <Box
        position={"absolute"}
        top={0}
        height={"100vh"}
        width={"100vw"}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <AuroraSpinner />
      </Box>
    );
  }

  if (isAuthenticated) {
    // const from = location.state?.from?.pathname
    //   ? `${location.state?.from?.pathname}${location?.state?.from?.search}`
    //   : "/";

    return <Navigate to={"/"} replace={true} />;
  }

  return <>{children}</>;
};
