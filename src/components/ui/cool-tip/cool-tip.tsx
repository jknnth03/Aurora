// Dependencies: npm install react-hotkeys-hook
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import Popper from "@mui/material/Popper";
import Slide from "@mui/material/Slide";
import { alpha, useTheme } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useLongPress } from "@uidotdev/usehooks";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Close from "@mui/icons-material/Close";

// Extended props to include alternative title
interface ExtendedTooltipProps extends TooltipProps {
  alttitle?: TooltipProps["title"]; //while ctrl key is down, use alternatives
  alticon?: React.ReactNode;
}

export const ToolTipPopper = (props: ExtendedTooltipProps) => {
  const [openTip, setOpenTip] = useState(false);
  const [shouldClickAway, setShouldClickaway] = useState(true);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const anchorRef = useRef(null);
  const theme = useTheme();

  // Track Ctrl key state with react-hotkeys-hook
  useHotkeys("ctrl", () => setIsCtrlPressed(true), {
    keydown: true,
    keyup: false,
  });

  useHotkeys("ctrl", () => setIsCtrlPressed(false), {
    keydown: false,
    keyup: true,
  });

  const closeTip = () => {
    setShouldClickaway(true);
    setOpenTip(false);
  };

  const triggerTip = () => {
    setOpenTip(true);
  };

  const attrs = useLongPress(
    () => {
      triggerTip();
      setShouldClickaway(false);
    },
    {
      onFinish: () => {
        setTimeout(() => setShouldClickaway(true), 1000);
      },
      threshold: 500,
    },
  );

  const variantColor = props?.variant
    ? theme.palette[props?.variant ?? "primary"]
    : theme.palette[props?.variant ?? "secondary"];

  // Determine which title and icon to show
  const currentTitle =
    isCtrlPressed && props.alttitle ? props.alttitle : props.title;
  const currentIcon =
    isCtrlPressed && props.alticon ? props.alticon : props.icon;

  return (
    <>
      <Box
        ref={anchorRef}
        {...attrs}
        className="tooltip-popper__trigger"
        color={openTip ? theme.palette.secondary.main : "inherit"}
        sx={{ transition: "color 0.3s ease" }}>
        {props.children}
      </Box>

      <Popper
        open={openTip}
        placement="top"
        transition
        className="tooltip-popper"
        modifiers={[
          {
            name: "offset",
            // options: {
            // 	offset: [0, "100%"],s
            // },
          },
        ]}
        sx={{
          position: "fixed",
          zIndex: 1500,
          padding: 1,
          top: 0,
          width: "100vw",
        }}>
        {({ TransitionProps }) => (
          <ClickAwayListener
            onClickAway={() => {
              if (shouldClickAway) closeTip();
            }}>
            <Box
              className="tooltip-popper__container"
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                minWidth: "100%",
                padding: 2,
              }}>
              <Slide
                direction="down"
                {...TransitionProps}
                timeout={{ enter: 300, exit: 200 }}>
                <Box
                  className="tooltip-popper__content-wrapper"
                  sx={{
                    position: "relative",
                    maxWidth: "100vw",
                    width: "auto",
                    margin: "0 .5rem",
                  }}>
                  <IconButton
                    size="small"
                    onClick={closeTip}
                    className="tooltip-popper__close-button"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.8),
                      position: "absolute",
                      bottom: -10,
                      height: 18,
                      width: 18,
                      right: 15,
                      fontSize: 12,
                      color: theme.palette.primary.contrastText,
                      zIndex: 2,
                      backdropFilter: "blur(1px)",
                      boxShadow: theme.shadows[2],
                    }}>
                    <Close
                      fontSize="inherit"
                      className="tooltip-popper__close-icon"
                    />
                  </IconButton>
                  <Card
                    className="tooltip-popper__card"
                    sx={{
                      padding: "0.5rem 1rem",
                      backgroundColor: alpha(variantColor.main, 0.8),
                      borderRadius: theme.shape.borderRadius,
                      backdropFilter: "blur(1px)",
                      boxShadow: theme.shadows[2],
                      color: variantColor.contrastText,
                      transition: "all 0.2s ease",
                    }}>
                    <Typography
                      fontSize={11}
                      variant="subtitle2"
                      className="tooltip-popper__title"
                      sx={{ display: "flex", gap: 1 }}
                      lineHeight={"11px"}>
                      {currentIcon && (
                        <SvgIcon
                          className="tooltip-popper__icon"
                          sx={{
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          {currentIcon}
                        </SvgIcon>
                      )}
                      <span>{currentTitle}</span>
                    </Typography>
                  </Card>
                </Box>
              </Slide>
            </Box>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

const CoolTip = (props: ExtendedTooltipProps) => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Track Ctrl key state with react-hotkeys-hook
  useHotkeys("ctrl", () => setIsCtrlPressed(true), {
    keydown: true,
    keyup: false,
  });

  useHotkeys("ctrl", () => setIsCtrlPressed(false), {
    keydown: false,
    keyup: true,
  });

  // Determine which title and icon to show
  const currentTitle =
    isCtrlPressed && props.alttitle ? props.alttitle : props.title;
  const currentIcon =
    isCtrlPressed && props.alticon ? props.alticon : props.icon;

  if (isMobile)
    return <ToolTipPopper {...props}>{props.children}</ToolTipPopper>;

  return (
    <Tooltip
      {...props}
      className="cool-tip"
      title={
        currentTitle && (
          <Box
            component={"div"}
            className="cool-tip__content"
            display={"flex"}
            gap={1}
            lineHeight={"11px"}
            paddingY={0.5}
            sx={{ transition: "all 0.2s ease" }}>
            {currentIcon && (
              <SvgIcon
                className="cool-tip__icon"
                sx={{
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 0,
                  margin: 0,
                }}>
                {currentIcon}
              </SvgIcon>
            )}
            <span>{currentTitle}</span>
          </Box>
        )
      }>
      {props.children}
    </Tooltip>
  );
};

export default CoolTip;
