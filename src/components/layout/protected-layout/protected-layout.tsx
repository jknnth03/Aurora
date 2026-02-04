import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { Sidebar as Sbar } from "@phosphor-icons/react";
import moment from "moment";
import { ReactNode, useRef } from "react";
import { Navigate, useLocation } from "react-router";
import { CONFIG } from "../../../config/config";
import QueryDialogs from "../../dialogs/query-dialogs";
import BatteryMarker from "../../ui/battery-marker/battery-marker";
import CurrentDate from "../../ui/current-date-text/current-date";
import NetworkStatusMarker from "../../ui/network-status-marker/network-status-marker";
import Pathnko from "../../ui/pathnko/pathnko";
import ProcessMarker from "../../ui/process-marker/process-marker";
import Sidebar, { SidebarRef } from "../../ui/sidebar/sidebar";
import SidebarTrigger from "../../ui/sidebar/sidebar-trigger";
import Footer from "./components/footer";
import "./protected-layout.scss";

interface ProtectedLayoutProps {
  children: ReactNode;
}
moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1 s",
    ss: "%d secs",
    m: "1 m",
    mm: "%d m",
    h: "1 h",
    hh: "%d h",
    d: "1 d",
    dd: "%d d",
    M: "1 m",
    MM: "%d m",
    y: "1 y",
    yy: "%d y",
  },
});

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const location = useLocation();

  const sidebarRef = useRef<SidebarRef>(null);
  if (location.pathname === "/") {
    return (
      <Navigate
        to={CONFIG.ROUTES.DASHBOARD.PATH}
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <div className="protected-layout">
      <Sidebar ref={sidebarRef} />
      <Box className="protected-layout__content">
        <Box className="protected-layout__header">
          <SidebarTrigger
            asIcon={true}
            sidebarRef={sidebarRef}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}>
            <Sbar />
          </SidebarTrigger>
          <Box className="protected-layout__toolbar">
            <Box className="protected-layout__toolbar-container protected-layout__toolbar-container--left">
              <Pathnko />
            </Box>
            <Box className="protected-layout__toolbar-container protected-layout__toolbar-container--right">
              <Box>
                <ProcessMarker />
              </Box>
              <Box>
                <NetworkStatusMarker />
              </Box>
              <Box>
                <BatteryMarker />
              </Box>
              <Box>
                <CurrentDate />
              </Box>
            </Box>
          </Box>
        </Box>
        <QueryDialogs />
        <Box className="protected-layout__children">{children}</Box>
        <Footer />
      </Box>
    </div>
  );
};

export default ProtectedLayout;
