import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import React, { useState, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { formatShortcut } from "../../../utils/formatShortcut";

interface SmartButtonProps extends ButtonProps {
	shortcut?: string;
	showShortcut?: boolean;
	hotkeyOptions?: {
		preventDefault?: boolean;
		enabled?: boolean;
	};
}

const SmartButton: React.FC<SmartButtonProps> = ({
	children,
	shortcut,
	onClick,
	showShortcut = true,
	hotkeyOptions = { preventDefault: true, enabled: true },
	disabled = false,
	sx = {},
	...buttonProps
}) => {
	const [isPressed, setIsPressed] = useState<boolean>(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useHotkeys(
		shortcut || "",
		(e: KeyboardEvent) => {
			if (!disabled && buttonRef.current) {
				if (hotkeyOptions.preventDefault) {
					e.preventDefault();
				}

				setIsPressed(true);

				// Trigger the button's native click event
				buttonRef.current.click();

				setTimeout(() => setIsPressed(false), 150);
			}
		},
		{
			preventDefault: hotkeyOptions.preventDefault,
			enabled: hotkeyOptions.enabled && !disabled && !!shortcut,
		}
	);

	return (
		<Box sx={{ position: "relative", display: "inline-block" }}>
			<Button
				{...buttonProps}
				ref={buttonRef}
				disabled={disabled}
				onClick={onClick}
				sx={{
					position: "relative",
					transition: "all 0.2s ease",
					transform: isPressed ? "scale(0.95)" : "scale(1)",
					boxShadow: isPressed ? "inset 0 2px 4px rgba(0,0,0,0.2)" : undefined,
					...sx,
				}}
			>
				{children}
			</Button>

			{showShortcut && shortcut && (
				<Chip
					size="small"
					variant="filled"
					label={formatShortcut(shortcut)}
					sx={{
						pointerEvents: "none",
						position: "absolute",
						top: "85%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						height: 14,
						fontSize: "0.45rem",
						backgroundColor: "transparent",
						color: "primary.contrastText",
						zIndex: 1,
					}}
				/>
			)}
		</Box>
	);
};

export default SmartButton;
