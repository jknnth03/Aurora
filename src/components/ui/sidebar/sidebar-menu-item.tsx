import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { Heart } from "@phosphor-icons/react";
import React, { memo, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import { TModule } from "../../../config/modules/modules";
import { useBookmark } from "../bookmarks/useBookmark";
import ContextMenu from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
import CoolTip from "../cool-tip/cool-tip";
import IconToggle from "../icon-toggle/icon-toggle";
import useSidebarContextMenu from "./useSidebarContextMenu";

type SidebarMenuItemProps = {
  module: TModule;
  isActive: boolean;
  isExpanded: boolean;
  isDrawerOpen: boolean;
  isCollapsing: boolean;
  onItemClick: (module: TModule) => void;
  onChildClick: (path: string) => void;
  isSubmenuItem?: boolean;
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = memo(
  ({
    module,
    isActive,
    isExpanded,
    isDrawerOpen,
    isCollapsing,
    onItemClick,
    onChildClick,
    isSubmenuItem = false,
  }) => {
    const { isBookmarked } = useBookmark();
    const location = useLocation();
    const { getMenuItemsForModule } = useSidebarContextMenu();
    const { contextMenu, handleContextMenu, handleCloseContextMenu } =
      useContextMenu<TModule>();

    const lastSubmenuItemRef = useRef<HTMLDivElement>(null);

    const hasChildren = useMemo(
      () => module.CHILDREN && Object.keys(module.CHILDREN).length > 0,
      [module.CHILDREN],
    );

    const containerClass = useMemo(
      () =>
        isSubmenuItem
          ? `sidebar__submenu-item ${
              isActive ? "sidebar__submenu-item--active" : ""
            }`
          : `sidebar__menu-item ${
              isActive ? "sidebar__menu-item--active" : ""
            }`,
      [isSubmenuItem, isActive],
    );

    const childEntries = useMemo(
      () => (module.CHILDREN ? Object.entries(module.CHILDREN) : []),
      [module.CHILDREN],
    );

    const handleClick = useCallback(() => {
      if (isSubmenuItem) {
        onChildClick(module.PATH);
      } else {
        onItemClick(module);

        if (hasChildren && !isExpanded && isDrawerOpen) {
          setTimeout(() => {
            lastSubmenuItemRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }, 350);
        }
      }
    }, [
      isSubmenuItem,
      module,
      onItemClick,
      onChildClick,
      hasChildren,
      isExpanded,
      isDrawerOpen,
    ]);

    const handleContextMenuClick = useCallback(
      (event: React.MouseEvent) => {
        handleContextMenu(event, module);
      },
      [handleContextMenu, module],
    );

    const iconClass = isSubmenuItem
      ? "sidebar__submenu-icon"
      : "sidebar__menu-icon";
    const textClass = isSubmenuItem
      ? "sidebar__submenu-text"
      : "sidebar__menu-text";

    const tooltipTitle = useMemo(
      () => (!isDrawerOpen && !isSubmenuItem ? module.ALIAS : ""),
      [isDrawerOpen, isSubmenuItem, module.ALIAS],
    );

    const menuItem = useMemo(
      () => (
        <CoolTip
          title={tooltipTitle}
          placement="right"
          arrow
          aria-label={module.ALIAS}>
          <Box
            className={containerClass}
            onClick={handleClick}
            onContextMenu={handleContextMenuClick}
            aria-label={module.ALIAS}>
            <Badge
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              badgeContent={
                isBookmarked(module.ALIAS) ? (
                  <Heart
                    height={12}
                    weight="fill"
                    color="var(--error-light)"
                    style={{ transform: "rotate(-20deg)" }}
                  />
                ) : (
                  <></>
                )
              }
              aria-label={"bookmark"}
              title={`You have bookmarked this module`}>
              <Box className={iconClass}>
                {isActive ? module.ICON_ON : module.ICON}
              </Box>
            </Badge>
            {(isDrawerOpen || isSubmenuItem) && (
              <>
                <Box className={textClass}>{module.ALIAS}</Box>
                {!isSubmenuItem && hasChildren && (
                  <IconToggle
                    isExpanded={isExpanded}
                    className="sidebar__menu-toggle"
                  />
                )}
              </>
            )}
          </Box>
        </CoolTip>
      ),
      [
        tooltipTitle,
        containerClass,
        handleClick,
        handleContextMenuClick,
        iconClass,
        isActive,
        module.ICON_ON,
        module.ICON,
        isDrawerOpen,
        isSubmenuItem,
        textClass,
        module.ALIAS,
        hasChildren,
        isBookmarked,
        isExpanded,
      ],
    );

    const submenuItems = useMemo(() => {
      if (!hasChildren || !childEntries.length) return null;

      return childEntries.map((child, childIndex) => {
        const isChildActive =
          location.pathname === child[1].PATH ||
          (child[1].PATH !== "/" &&
            location.pathname.startsWith(`${child[1].PATH}/`));

        const isLastItem = childIndex === childEntries.length - 1;

        return (
          <Box
            key={`child-${module.PATH}-${childIndex}`}
            ref={isLastItem ? lastSubmenuItemRef : undefined}>
            <SidebarMenuItem
              module={child[1]}
              isActive={isChildActive}
              isExpanded={false}
              isDrawerOpen={isDrawerOpen}
              isCollapsing={isCollapsing}
              onItemClick={onItemClick}
              onChildClick={onChildClick}
              isSubmenuItem={true}
            />
          </Box>
        );
      });
    }, [
      hasChildren,
      childEntries,
      location.pathname,
      module.PATH,
      isDrawerOpen,
      isCollapsing,
      onItemClick,
      onChildClick,
    ]);

    const contextMenuComponent = useMemo(
      () => (
        <ContextMenu
          contextMenu={contextMenu}
          menuItems={getMenuItemsForModule}
          onClose={handleCloseContextMenu}
        />
      ),
      [contextMenu, getMenuItemsForModule, handleCloseContextMenu],
    );

    if (!isSubmenuItem && hasChildren && (isDrawerOpen || isCollapsing)) {
      return (
        <>
          {menuItem}
          <Collapse
            in={isExpanded && isDrawerOpen}
            timeout={300}
            unmountOnExit
            className="sidebar__collapse">
            <Box className="sidebar__submenu">
              <Box className="sidebar__active-sub-bg" />
              {submenuItems}
            </Box>
          </Collapse>
          {contextMenuComponent}
        </>
      );
    }

    return (
      <>
        {menuItem}
        {contextMenuComponent}
      </>
    );
  },
);

SidebarMenuItem.displayName = "SidebarMenuItem";

export default SidebarMenuItem;
