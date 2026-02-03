// File: components/shared/context-menu/context-menu.tsx
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import { ReactNode } from "react";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import { JSX } from "react";

// Define the interface for a context menu item
export interface ContextMenuItem<T> {
  id: string;
  // Changed to accept either a string or a function that returns a string
  label: string | ((item: T) => string) | JSX.Element;
  icon: ReactNode | ((item: T) => ReactNode);
  disabled?: boolean;
  onClick: (item: T) => void;
  menuItemProps?: MenuItemProps; // For additional MenuItem props
}

// Context menu state interface
export interface ContextMenuState<T> {
  mouseX: number;
  mouseY: number;
  item: T;
}

// Props for the TableContextMenu component
interface ContextMenuProps<T>
  extends Partial<Omit<MenuProps, "onClose" | "contextMenu">> {
  contextMenu: ContextMenuState<T> | null;
  menuItems?: (item: T) => Array<ContextMenuItem<T>>;
  disabled?: boolean;
  onClose: () => void;
}

function ContextMenu<T>({
  contextMenu,
  menuItems,
  onClose,
  ...props
}: ContextMenuProps<T>) {
  const { currentParams } = useRememberQueryParams();
  if (!contextMenu || !menuItems) return null;
  // Get menu items for the current item
  const items = menuItems(contextMenu.item);

  return (
    <Menu
      {...props}
      // elevation={1}
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      // transitionDuration={0}
      onClick={(e) => e.stopPropagation()}
      slotProps={{
        paper: {
          sx: { px: 1 },
        },
      }}
    >
      {items.map((menuItem, index) => {
        const isEdit =
          typeof menuItem.label === "string"
            ? menuItem.label.includes("Edit")
            : false;
        return currentParams.status === "active" ||
          currentParams.status === undefined ? (
          <MenuItem
            key={menuItem.id + index}
            onClick={() => {
              menuItem.onClick(contextMenu.item);
              onClose();
            }}
            disabled={menuItem.disabled}
            sx={{ borderRadius: 1 }}
            {...menuItem.menuItemProps}
          >
            {menuItem.icon && (
              <ListItemIcon>
                {typeof menuItem.icon === "function"
                  ? menuItem.icon(contextMenu.item)
                  : menuItem.icon}
              </ListItemIcon>
            )}
            <ListItemText>
              {/* Updated to handle both string and function cases */}
              {typeof menuItem.label === "function"
                ? menuItem.label(contextMenu.item)
                : menuItem.label}
            </ListItemText>
          </MenuItem>
        ) : (
          !isEdit && (
            <MenuItem
              key={menuItem.id + index}
              onClick={() => {
                menuItem.onClick(contextMenu.item);
                onClose();
              }}
              disabled={menuItem.disabled}
              sx={{ borderRadius: 1 }}
              {...menuItem.menuItemProps}
            >
              {menuItem.icon && (
                <ListItemIcon>
                  {typeof menuItem.icon === "function"
                    ? menuItem.icon(contextMenu.item)
                    : menuItem.icon}
                </ListItemIcon>
              )}
              <ListItemText>
                {/* Updated to handle both string and function cases */}
                {typeof menuItem.label === "function"
                  ? menuItem.label(contextMenu.item)
                  : menuItem.label}
              </ListItemText>
            </MenuItem>
          )
        );
      })}
    </Menu>
  );
}

export default ContextMenu;
