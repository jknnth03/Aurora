import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  DotsThreeVertical,
  MagnifyingGlass,
  Moon,
  Sun,
  Info,
  Trash,
  Palette,
  BookmarkSimple,
} from "@phosphor-icons/react";
import { RefObject, useCallback, useMemo, useRef } from "react";
import useContextMenu from "../../../ui/context-menu/useContextMenu";
import ContextMenu, {
  ContextMenuItem,
} from "../../../ui/context-menu/context-menu";
import Bookmarks, {
  BookmarksRef,
  BookmarkToggleButton,
} from "../../../ui/bookmarks/bookmarks";
import Finder, { FinderHandle, FinderIcon } from "../../../ui/finder/finder";
import LightDarkModeSwitch from "../../../ui/light-dark-mode-switch/light-dark-mode-toggle";
import ThemePickerButton from "../../../ui/theme-picker/theme-picker-button";

import MouskaTool from "../../../../assets/mickey.svg?react";
import { PhosphorIcon } from "../../../../hooks/usePhosphorIcon";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { CONFIG } from "../../../../config/config";

interface FooterAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const bookmarksRef = useRef<BookmarksRef>(null);
  const finderRef = useRef<FinderHandle>(null);
  const lightDarkModeRef = useRef<HTMLButtonElement>(null);

  const { open } = useOpenCreate("");

  const toggleBookmarks = useCallback(() => {
    bookmarksRef.current?.toggleBookmarksVisibility();
  }, []);

  const toggleFinder = useCallback(() => {
    finderRef.current?.open();
  }, []);

  const toggleLightDarkMode = useCallback(() => {
    if (lightDarkModeRef.current) {
      lightDarkModeRef.current.click();
    }
  }, []);

  const { contextMenu, handleContextMenu, handleCloseContextMenu } =
    useContextMenu<FooterAction>();

  const footerActions: FooterAction[] = useMemo(
    () => [
      {
        id: "finder",
        label: "Finder",
        icon: <Finder ref={finderRef} />,
        onClick: toggleFinder,
      },
      {
        id: "mode-switch",
        label: `Turn ${theme.palette.mode === "dark" ? "Light" : "Dark"} Mode`,
        icon: <LightDarkModeSwitch size="xxxs" ref={lightDarkModeRef} />,
        onClick: toggleLightDarkMode,
      },
      {
        id: "theme-picker",
        label: "Theme Picker",
        icon: <ThemePickerButton />,
        onClick: () => {
          open(CONFIG.SUFFIX.theme_picker);
        },
      },
      {
        id: "bookmarks",
        label: "Toggle Bookmarks",
        icon: <BookmarkSimple size={18} />,
        onClick: toggleBookmarks,
      },
    ],
    [
      theme.palette.mode,
      toggleBookmarks,
      open,
      toggleFinder,
      toggleLightDarkMode,
    ],
  );

  const getContextMenuItems =
    useCallback((): ContextMenuItem<FooterAction>[] => {
      return footerActions.map((action) => ({
        id: action.id,
        label: action.label,
        icon: action.icon,
        disabled: action.disabled,
        onClick: action.onClick,
      }));
    }, [footerActions]);

  const handleMobileMenuClick = useCallback(
    (event: React.MouseEvent) => {
      handleContextMenu(event, footerActions[0]);
    },
    [handleContextMenu, footerActions],
  );

  if (isMobile) {
    return (
      <>
        <Box className="protected-layout__footer protected-layout__footer--mobile">
          <IconButton
            size="small"
            onClick={handleMobileMenuClick}
            onContextMenu={handleMobileMenuClick}
            sx={{
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}>
            <MouskaTool height={20} />
          </IconButton>

          <Box>
            <Bookmarks ref={bookmarksRef} />
          </Box>
        </Box>

        <ContextMenu<FooterAction>
          contextMenu={contextMenu}
          menuItems={getContextMenuItems}
          onClose={handleCloseContextMenu}
          slotProps={{}}
        />
      </>
    );
  }

  return (
    <Box className="protected-layout__footer">
      <Finder />

      <Box>
        <BookmarkToggleButton onClick={toggleBookmarks} />
      </Box>
      <Divider orientation="vertical" />
      <Bookmarks ref={bookmarksRef} />
    </Box>
  );
};

export default Footer;
