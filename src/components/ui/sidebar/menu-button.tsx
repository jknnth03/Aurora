import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React, { ReactNode } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import { ButtonProps } from "@mui/material/Button";

type MenuButtonProps = {
	// Core props
	icon: ReactNode;
	activeIcon?: ReactNode;
	isActive?: boolean;
	onClick?: ButtonProps["onClick"];

	// Content options
	content?: ReactNode; // Allows any content beside the icon
	label?: string; // Simple text alternative to content
	showContent?: boolean; // Whether to show the content/label

	// Right element
	rightIcon?: ReactNode; // Icon or element to display at the right

	// Styling
	tooltipText?: string;
	className?: string;
	sx?: SxProps<Theme>;
	onContextMenu?: ButtonProps["onContextMenu"];
	isSubmenuStyle?: boolean;
	contentSx?: SxProps<Theme>; // For content container styling
	rightIconSx?: SxProps<Theme>; // For right icon styling
};

const MenuButton: React.FC<MenuButtonProps> = ({
	icon,
	activeIcon,
	isActive = false,
	onClick,
	content,
	label,
	showContent = true,
	rightIcon,
	tooltipText,
	className = "",
	onContextMenu,
	sx,
	isSubmenuStyle = false,
	contentSx,
	rightIconSx,
}) => {
	// Determine which icon to show based on active state
	const displayIcon = isActive && activeIcon ? activeIcon : icon;

	// Determine CSS classes based on menu type and active state
	const containerClass = isSubmenuStyle
		? `sidebar__submenu-item ${isActive ? "sidebar__submenu-item--active" : ""} ${className}`
		: `sidebar__menu-item ${isActive ? "sidebar__menu-item--active" : ""} ${className}`;

	const iconClass = isSubmenuStyle ? "sidebar__submenu-icon" : "sidebar__menu-icon";
	const textClass = isSubmenuStyle ? "sidebar__submenu-text" : "sidebar__menu-text";

	// Determine what content to show beside the icon
	const displayContent = content || (label ? <span>{label}</span> : null);

	return (
		<Tooltip title={!showContent && tooltipText ? tooltipText : ""} placement="right" arrow>
			<Box
				component="button"
				className={containerClass}
				onClick={onClick}
				sx={{
					// Default styles that can be overridden
					width: "auto",
					display: "flex",
					alignItems: "center",
					cursor: "pointer",
					background: "none", // Reset button styles
					border: "none", // Reset button styles
					padding: 0, // Reset button styles
					...sx, // Custom styles override defaults
				}}
				onContextMenu={onContextMenu}
			>
				{/* Left icon */}
				<Box className={iconClass}>{displayIcon}</Box>

				{/* Main content */}
				{showContent && displayContent && (
					<Box
						className={textClass}
						sx={{
							display: "flex",
							// bgcolor:"red",
							flexGrow: 1,
							overflow: "hidden",
							ml: 1, // Add default left margin for spacing
							...contentSx, // Apply custom content styling
						}}
					>
						{displayContent}
					</Box>
				)}

				{/* Right icon */}
				{rightIcon && (
					<Box
						className="sidebar__menu-toggle" // Use the same class as the toggle icon for consistent positioning
						sx={{
							display: "flex",
							alignItems: "center",
							marginLeft: "auto",
							position: "relative",
							right: "1rem", // Match the position of the toggle icon
							opacity: 1, // Make sure it's visible
							...rightIconSx,
						}}
					>
						{rightIcon}
					</Box>
				)}
			</Box>
		</Tooltip>
	);
};

export default MenuButton;
