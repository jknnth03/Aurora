import Box from "@mui/material/Box";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Resize, Square, X } from "@phosphor-icons/react";
import React, {
  Children,
  ReactNode,
  RefObject,
  isValidElement,
  useCallback,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CONFIG } from "../../../config/config";
import { getCookie, setCookie } from "../../../utils/cookie";
import CoolTip from "../cool-tip/cool-tip";
import { DialogTitleActions } from "./components/dialog-title";
import { ContentNode } from "react-to-print/lib/types/ContentNode";

// const Transition = React.forwardRef(function Transition(
// 	props: TransitionProps & {
// 		children: React.ReactElement<any, any>;
// 	},
// 	ref: React.Ref<unknown>
// ) {
// 	return <Slide direction="up" ref={ref} {...props} />;
// });

const Puller = styled("div")(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: "GrayText",
  borderRadius: 3,
  position: "absolute",
  top: 8,
  left: "calc(50% - 15px)",
  cursor: "pointer",
  ...theme.applyStyles("dark", {
    backgroundColor: "HighlightText",
  }),
}));

const fullscreenShortcut = "alt+enter";

export interface ResponsiveDialogProps {
  open: boolean;
  onClose?: () => void;
  onOpen?: () => void; // Required for SwipeableDrawer
  children: ReactNode;
  dialogProps?: Omit<DialogProps, "open">;
  drawerProps?: DrawerProps;
  disableClickAway?: boolean;
  maximize?: boolean;
  maxHeight?: string;
  ref?: RefObject<ContentNode>;
  toPrint?: boolean;
}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  open,
  onClose,
  onOpen,
  children,
  dialogProps,
  drawerProps,
  disableClickAway = false,
  maximize = true,
  maxHeight = "90vh",
  ref = null,
  toPrint = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dialogSize = getCookie(CONFIG.STORAGE.DIALOG_SIZE.LABEL);
  // Use state to track cookie value so component re-renders when it changes
  const [cookieValue, setCookieValue] = useState<string>(dialogSize ?? "md");
  const isFullScreen = cookieValue === "fullscreen";
  // Extract DialogTitleActions component from children if present
  let titleActions: ReactNode = null;
  const otherChildren = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === DialogTitleActions) {
      titleActions = child;
      return null; // Don't render DialogTitleActions in the regular children flow
    }
    return child;
  });

  const handleDialogSize = useCallback(() => {
    const newSize = isFullScreen ? "md" : "fullscreen";
    setCookie(CONFIG.STORAGE.DIALOG_SIZE.LABEL, newSize, { expires: 30 });
    setCookieValue(newSize);
  }, [isFullScreen]);

  useHotkeys(
    fullscreenShortcut,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (open) handleDialogSize();
    },
    [handleDialogSize, open]
  );
  // Header actions container - handles both title actions and minimize button
  const HeaderControls = () => (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: theme.zIndex.modal + 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {titleActions}
      {(!isMobile || isFullScreen) && (
        <Box sx={{ display: "flex", gap: 1 }}>
          {maximize && (
            <CoolTip title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton size="small" onClick={handleDialogSize}>
                {cookieValue === "md" || !cookieValue ? (
                  <Square fontSize="inherit" />
                ) : (
                  <Resize fontSize="inherit" />
                )}
              </IconButton>
            </CoolTip>
          )}
          <CoolTip title={"Close Dialog"}>
            <IconButton size="small" onClick={onClose}>
              <X fontSize="inherit" />
            </IconButton>
          </CoolTip>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        disableDiscovery
        disableSwipeToOpen
        {...drawerProps}
        slotProps={{
          paper: {
            ...drawerProps?.slotProps?.paper,
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              p: 2,
            },
          },
        }}
        // Use properly typed event handlers
        onClose={() => {
          if (onClose) return onClose();
        }}
        onOpen={() => {
          if (onOpen) return onOpen();
        }}
      >
        <Box sx={{ width: "auto", position: "relative", minHeight: 100 }}>
          {/* Puller for standard mobile behavior */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3, mt: 1 }}>
            <Puller onClick={() => onClose && onClose()} />
          </Box>

          {/* Display header controls in mobile view too */}
          <HeaderControls />

          {/* Content */}
          <Box sx={{ mt: 4 }}>{otherChildren}</Box>
        </Box>
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={!disableClickAway && onClose ? () => onClose() : undefined}
      fullWidth
      maxWidth={false} // Override MUI maxWidth behavior
      {...dialogProps}
      slotProps={{
        paper: {
          ...dialogProps?.slotProps?.paper,
          elevation: 0,
          sx: {
            visibility: toPrint ? "hidden" : "visible",
            position: "relative",
            width: isFullScreen ? "100vw" : "1200px",
            height: isFullScreen ? "100vh" : "100%",
            maxWidth: isFullScreen ? "100vw" : "1200px",
            maxHeight: isFullScreen ? "100vh" : maxHeight,
            margin: isFullScreen ? 0 : "32px auto",
            borderRadius: isFullScreen ? 0 : "default",
            transition: "all 0.4s ease",

            ...(dialogProps?.slotProps?.paper &&
            typeof dialogProps.slotProps.paper === "object" &&
            "sx" in dialogProps.slotProps.paper
              ? (dialogProps.slotProps.paper as { sx?: object }).sx
              : {}),
          },
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        transition: {
          // Leave blank or tweak if needed
        },
        ...dialogProps?.slotProps,
      }}
      slots={{
        ...dialogProps?.slots,
      }}
    >
      <HeaderControls />
      {otherChildren}
    </Dialog>
  );
};
