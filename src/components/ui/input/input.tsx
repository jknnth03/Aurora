import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment, {
  InputAdornmentProps,
} from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { TooltipProps } from "@mui/material/Tooltip";
import { BowlingBall, PushPin, Question } from "@phosphor-icons/react";
import { forwardRef, ReactNode, Ref } from "react";
import CoolTip from "../cool-tip/cool-tip";

// Extend TextFieldProps with our custom props
export interface InputProps extends Omit<TextFieldProps, "slotProps" | "size"> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startAdornmentProps?: InputAdornmentProps;
  endAdornmentProps?: InputAdornmentProps;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
  slotProps?: TextFieldProps["slotProps"];
  size?: "small" | "medium";
  tooltip?: string | React.ReactNode;
  toolTipProps?: TooltipProps; // Optional styling for tooltip button
}

const Input = forwardRef(
  (
    {
      startIcon,
      endIcon,
      onStartIconClick,
      onEndIconClick,
      endAdornmentProps,
      startAdornmentProps,
      slotProps = {},
      size = "small",
      tooltip,
      toolTipProps,
      ...props
    }: InputProps,
    ref: Ref<HTMLDivElement>
  ) => {
    // Create standard adornments without the tooltip
    const startAdornment = startIcon ? (
      <InputAdornment
        position="start"
        onClick={onStartIconClick}
        sx={{ cursor: onStartIconClick ? "pointer" : "default" }}
        {...startAdornmentProps}
      >
        {startIcon}
      </InputAdornment>
    ) : undefined;

    const endAdornment = endIcon ? (
      <InputAdornment
        position="end"
        onClick={onEndIconClick}
        sx={{ cursor: onEndIconClick ? "pointer" : "default" }}
        {...endAdornmentProps}
      >
        {endIcon}
      </InputAdornment>
    ) : (
      <InputAdornment
        position="end"
        onClick={onEndIconClick}
        sx={{ cursor: onEndIconClick ? "pointer" : "default" }}
        {...endAdornmentProps}
      >
        <IconButton
          disableFocusRipple
          disabled
          disableTouchRipple
          disableRipple
          edge="end"
          size="small"
        >
          <BowlingBall color="transparent" />
        </IconButton>
      </InputAdornment>
    );

    const mergedSlotProps = {
      ...slotProps,
      input: {
        startAdornment: startAdornment,
        endAdornment: endAdornment,
        ...(slotProps.input || {}),
      },
      inputLabel: {
        ...slotProps.inputLabel,
        sx: {
          width: "fit-content",
          pr: 2,
          "& .MuiInputLabel-asterisk": {
            display: "none", // Hide the default asterisk completely
          },
          ...(slotProps.inputLabel && "sx" in slotProps.inputLabel
            ? slotProps.inputLabel.sx
            : {}),
        },
      },
    };

    return (
      <Box
        sx={{
          position: "relative",
        }}
      >
        <TextField
          size={size}
          slotProps={mergedSlotProps}
          ref={ref}
          {...props}
          label={
            props.label ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {tooltip && (
                  <CoolTip
                    title={tooltip}
                    arrow
                    placement="top-start"
                    icon={<Question color="inherit" size="24" />}
                    {...toolTipProps}
                  >
                    <Question size={16} />
                  </CoolTip>
                )}
                {props.label}
                {props.required && (
                  <CoolTip title={"Field required."} placement="top-start">
                    <PushPin
                      weight="fill"
                      size={12}
                      color="var(--mui-palette-error-main)"
                      style={{ position: "absolute", right: 5, top: 0 }}
                    />
                  </CoolTip>
                )}
              </Box>
            ) : undefined
          }
        />
      </Box>
    );
  }
);

// Add display name for better debugging
Input.displayName = "Input";

export default Input;
