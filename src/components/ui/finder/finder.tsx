import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Cow } from "@phosphor-icons/react";
import { useHotkeys } from "react-hotkeys-hook";
import { forwardRef, useImperativeHandle } from "react";
import { CONFIG } from "../../../config/config";
import { useOpenCreate } from "../../../hooks/useOpenCreate";
import { formatShortcut } from "../../../utils/formatShortcut";
import CoolTip from "../cool-tip/cool-tip";
import Input from "../input/input";
import "./finder.scss";
import { useFinderCaption } from "./useFinderCaption";

export const finderShortcut = "ctrl+alt+f";

export const finderTitle = "";

export const FinderIcon = Cow;

export const finderDescription =
  " or 'Hey Greggle!' is a finder/search utility that helps you graze through content until you find what you're looking for, fresh from the farms. ";

export const finderSubTitle =
  "Search modules, descriptions, paths, or type 'bookmarked' for favorites + matches...";

// Define the imperative handle interface
export interface FinderHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  refreshCaption: () => void;
  isOpen: boolean;
}

// Desktop Finder Component
interface FinderDesktopProps {
  onOpen: () => void;
  currentCaption: string;
}

export const FinderDesktop = ({
  onOpen,
  currentCaption,
}: FinderDesktopProps) => {
  return (
    <CoolTip title={`${currentCaption} (${finderShortcut.toUpperCase()})`}>
      <Box className="finder" onClick={onOpen}>
        <Input
          name="Input"
          label={finderTitle}
          className="finder__input"
          placeholder={formatShortcut(finderShortcut)}
          sx={{
            cursor: "pointer",
            maxWidth: "200px",
            input: {
              caretColor: "transparent",
              userSelect: "text",
            },
          }}
          slotProps={{
            input: {
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <FinderIcon weight="fill" fontWeight={900} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </CoolTip>
  );
};

// Mobile Finder Component
interface FinderMobileProps {
  onOpen?: () => void;
  currentCaption?: string;
}

export const FinderMobile = ({ onOpen, currentCaption }: FinderMobileProps) => {
  return (
    <CoolTip title={`${currentCaption} (${finderShortcut.toUpperCase()})`}>
      <Box className="finder" onClick={onOpen}>
        <IconButton className="finder__icon-btn" size="small">
          <FinderIcon weight="fill" />
        </IconButton>
      </Box>
    </CoolTip>
  );
};

// Main Finder Component (responsive) with imperative handle
const Finder = forwardRef<FinderHandle>((_, ref) => {
  const theme = useTheme();
  const { open, isOpen, close } = useOpenCreate("");
  const { currentCaption, refreshCaption } = useFinderCaption({});

  const isFinderOpen = isOpen(CONFIG.SUFFIX.finder);

  // Expose imperative methods
  useImperativeHandle(
    ref,
    () => ({
      open: () => open(CONFIG.SUFFIX.finder),
      close: () => close(),
      toggle: () => {
        if (isFinderOpen) {
          close();
        } else {
          open(CONFIG.SUFFIX.finder);
        }
      },
      refreshCaption,
      isOpen: isFinderOpen,
    }),
    [open, close, isFinderOpen, refreshCaption],
  );

  useHotkeys(
    finderShortcut,
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (!isFinderOpen) open(CONFIG.SUFFIX.finder);
    },
    [isFinderOpen, open],
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpen = () => open(CONFIG.SUFFIX.finder);

  return isMobile ? (
    <FinderMobile onOpen={handleOpen} currentCaption={currentCaption} />
  ) : (
    <FinderDesktop onOpen={handleOpen} currentCaption={currentCaption} />
  );
});

Finder.displayName = "Finder";

export default Finder;
