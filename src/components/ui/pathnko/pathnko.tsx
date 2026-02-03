import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { LineVertical } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import Aurora from "../../../assets/aurora.svg?react";
import { MODULES, TModule } from "../../../config/modules/modules";
import { usePageParams } from "../../../hooks/usePageParams";
import { Panko } from "./style-panko";
import { findPathObject } from "../../../utils/findPath";
import ContextMenu from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
import useSidebarContextMenu from "../sidebar/useSidebarContextMenu";

// I USE PATHNKO AS A NAME BECAUSE THE JAPANESE FOR BREADCRUMBS IS PANKO NOW COMBINED WITH NAVIGATION PATH-- Greg

const Pathnko = () => {
  const location = useLocation();

  const { getMenuItemsForModule } = useSidebarContextMenu();

  const { contextMenu, handleContextMenu, handleCloseContextMenu } =
    useContextMenu<TModule>();

  const { getQueryStringForPath } = usePageParams();

  const theme = useTheme();

  const isTabletMode = useMediaQuery(theme.breakpoints.down("md"));

  const currentModule = findPathObject(MODULES, location.pathname).filter(
    (mod) => mod !== MODULES.DASHBOARD,
  );

  const commonSx = isTabletMode
    ? {
        "&.MuiChip-root": {
          minWidth: "25px",
          "& .MuiChip-icon": {
            padding: 0,
            margin: 0,
          },
        },
        "& .MuiChip-label": {
          display: "none",
        },
      }
    : undefined;
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" separator={null}>
        <Link to={"/dashboard"}>
          <Panko
            label={isTabletMode ? "" : "Aurora"}
            sx={commonSx}
            icon={
              <Aurora
                height={"12px"}
                width={"12px"}
                color="var(--primary-main)"
              />
            }
            onContextMenu={(event) =>
              handleContextMenu(event, MODULES.DASHBOARD)
            }
          />
        </Link>

        {currentModule.map((module) => {
          const querystring = getQueryStringForPath(module.PATH);
          return (
            <Link to={module.PATH + querystring}>
              <Panko
                onContextMenu={(event) => handleContextMenu(event, module)}
                label={isTabletMode ? "" : module.ALIAS}
                sx={commonSx}
                icon={
                  module.ICON_ON ? (
                    <Box
                      display={"flex"}
                      sx={(theme) => ({
                        svg: {
                          fill: theme.palette.primary.main,
                          height: "13px",
                        },
                      })}>
                      {module.ICON_ON}
                    </Box>
                  ) : undefined
                }
              />
            </Link>
          );
        })}
      </Breadcrumbs>

      <ContextMenu
        contextMenu={contextMenu}
        menuItems={getMenuItemsForModule}
        onClose={handleCloseContextMenu}
      />
    </>
  );
};

export default Pathnko;
