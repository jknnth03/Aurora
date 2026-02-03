import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Sidebar as Sbar } from "@phosphor-icons/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { RootState } from "../../../app/store";
import { TModule } from "../../../config/modules/modules";
import { toggleDrawer } from "../../../features/slices/theme-slice";
import { usePageParams } from "../../../hooks/usePageParams";
import usePermission from "../../../hooks/usePermission";
import { isEmpty } from "../../../utils/isEmpty";
import SidebarFooter from "./sidebar-footer";
import SidebarHeader from "./sidebar-header";
import SidebarMenuItem from "./sidebar-menu-item";
import SidebarTrigger from "./sidebar-trigger";
import "./sidebar.scss";

export interface SidebarRef {
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
}

export const sidebarShortcut = "ctrl+alt+b";

export interface SidebarProps {}

const Sidebar = forwardRef<SidebarRef, SidebarProps>((props, ref) => {
  const location = useLocation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { getQueryStringForPath, clearParams, reset } = usePageParams();

  const isDrawerOpen = useSelector(
    (state: RootState) => state?.themeSlice.isDrawerOpen
  );
  const { permittedModules } = usePermission();
  const activeBgRef = useRef<HTMLDivElement>(null);

  const prevDrawerStateRef = useRef(isDrawerOpen);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const [isCollapsing, setIsCollapsing] = useState(false);

  const modulesWithChildren = useMemo(
    () => permittedModules.filter((module: TModule) => module.CHILDREN),
    [permittedModules]
  );

  const isItemActive = useCallback(
    (path: string) => {
      if (
        location.pathname === path ||
        (path !== "/" && location.pathname.startsWith(`${path}/`))
      ) {
        return true;
      }

      const parentModule = modulesWithChildren.find(
        (module) => module.PATH === path
      );
      if (parentModule && parentModule.CHILDREN) {
        return Object.values(parentModule.CHILDREN).some(
          (child) =>
            location.pathname === child.PATH ||
            (child.PATH !== "/" &&
              location.pathname.startsWith(`${child.PATH}/`))
        );
      }

      return false;
    },
    [location.pathname, modulesWithChildren]
  );

  useEffect(() => {
    let foundActiveParent = false;
    let foundActiveChild = false;

    permittedModules.forEach((module: TModule) => {
      if (isItemActive(module.PATH) && !foundActiveParent) {
        foundActiveParent = true;
      }

      if (module.CHILDREN) {
        const childIndex = Object.values(module.CHILDREN).findIndex((child) =>
          isItemActive(child.PATH)
        );

        if (childIndex !== -1 && !foundActiveChild) {
          foundActiveChild = true;

          if (isDrawerOpen) {
            setExpandedItems((prev) => ({
              ...prev,
              [module.PATH]: true,
            }));
          }
        }
      }
    });
  }, [
    location.pathname,
    isDrawerOpen,
    permittedModules,
    modulesWithChildren,
    isItemActive,
  ]);

  useEffect(() => {
    if (prevDrawerStateRef.current && !isDrawerOpen) {
      const hasExpandedItems = Object.values(expandedItems).some(
        (value) => value
      );

      if (hasExpandedItems) {
        setIsCollapsing(true);

        setExpandedItems({});

        setTimeout(() => {
          setIsCollapsing(false);
        }, 300);
      }
    }

    prevDrawerStateRef.current = isDrawerOpen;
  }, [expandedItems, isDrawerOpen]);

  const handleCloseDrawer = useCallback(() => {
    dispatch(toggleDrawer(false));
  }, [dispatch]);

  const handleOpenDrawer = useCallback(() => {
    dispatch(toggleDrawer(true));
  }, [dispatch]);

  const handleItemClick = (module: TModule) => {
    clearParams();
    reset();
    if (!isEmpty(module.CHILDREN)) {
      setExpandedItems((prev) => ({
        ...prev,
        [module.PATH]: !prev[module.PATH],
      }));

      if (!isDrawerOpen) {
        handleOpenDrawer();
      }
    } else {
      clearParams();
      reset();
      const queryString = getQueryStringForPath(module.PATH);
      if (queryString.includes("dg")) return;
      navigate(module.PATH + queryString);

      if (isMobile) {
        handleCloseDrawer();
      }
    }
  };

  const handleChildClick = (path: string) => {
    clearParams();
    reset();
    const queryString = getQueryStringForPath(path);
    if (queryString.includes("dg")) return;
    navigate(path + queryString);

    if (isMobile) {
      handleCloseDrawer();
    }
  };

  const handleDrawerToggle = useCallback(() => {
    if (isDrawerOpen) {
      const hasExpandedItems = Object.values(expandedItems).some(
        (value) => value
      );

      if (hasExpandedItems) {
        setIsCollapsing(true);
        setExpandedItems({});

        setTimeout(() => {
          handleCloseDrawer();
          setIsCollapsing(false);
        }, 300);
      } else {
        handleCloseDrawer();
      }
    } else {
      handleOpenDrawer();
    }
  }, [expandedItems, handleCloseDrawer, handleOpenDrawer, isDrawerOpen]);

  useImperativeHandle(
    ref,
    () => ({
      toggleDrawer: handleDrawerToggle,
      closeDrawer: handleCloseDrawer,
      openDrawer: handleOpenDrawer,
    }),
    [handleCloseDrawer, handleDrawerToggle, handleOpenDrawer]
  );

  useHotkeys(
    sidebarShortcut,
    (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDrawerToggle();
    },
    {
      preventDefault: true,
      enableOnFormTags: true, // Allow hotkey to work even when form elements are focused
      enableOnContentEditable: true,
    },
    [handleDrawerToggle] // Dependencies go here as the 4th parameter
  );

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (isDrawerOpen && isMobile) {
          handleCloseDrawer();
        }
      }}
      mouseEvent="onMouseDown"
    >
      <Box className={`sidebar sidebar--${isDrawerOpen}`}>
        {/* Replace standard DrawerTrigger with our custom one */}
        <Box className="drawer-trigger" onClick={handleDrawerToggle}>
          <SidebarTrigger asIcon={true}>
            <Sbar />
          </SidebarTrigger>
        </Box>
        <SidebarHeader />

        <Box className="sidebar__content">
          <Box className="sidebar__menu">
            {/* Active background element that moves between items */}
            <Box ref={activeBgRef} className="sidebar__active-bg" />

            {permittedModules.map((module: TModule, index: number) => (
              <SidebarMenuItem
                key={`module-${index}`}
                module={module}
                isActive={isItemActive(module.PATH)}
                isExpanded={expandedItems[module.PATH]}
                isDrawerOpen={isDrawerOpen}
                isCollapsing={isCollapsing}
                onItemClick={handleItemClick}
                onChildClick={handleChildClick}
              />
            ))}
          </Box>
        </Box>
        <Box className="sidebar__footer">
          <SidebarFooter />
        </Box>
      </Box>
    </ClickAwayListener>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
