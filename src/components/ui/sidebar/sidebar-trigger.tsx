import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import { ButtonBaseProps } from "@mui/material/ButtonBase";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { TooltipProps } from "@mui/material/Tooltip";
import { CaretCircleDoubleRight } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import CoolTip from "../cool-tip/cool-tip";
import IconToggle from "../icon-toggle/icon-toggle";
import { SidebarRef } from "../sidebar/sidebar";

type DrawerTriggerProps = {
	onClick?: ButtonBaseProps["onClick"];
	sidebarRef?: React.RefObject<SidebarRef | null>; // Updated to allow null
} & (
	| {
			asIcon: true;
			children?: React.ReactNode;
			buttonProps?: never;
			iconButtonProps?: Omit<IconButtonProps, "onClick">;
	  }
	| {
			asIcon?: false;
			children?: React.ReactNode;
			buttonProps?: Omit<ButtonProps, "onClick">;
			iconButtonProps?: never;
	  }
);

const SidebarTrigger = ({
	onClick,
	asIcon = false,
	children,
	buttonProps,
	iconButtonProps,
	sidebarRef,
}: DrawerTriggerProps) => {
	const isDrawerOpen = useSelector((state: RootState) => state.themeSlice.isDrawerOpen);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (onClick) {
			onClick(e);
		}
		if (sidebarRef?.current) {
			sidebarRef?.current?.toggleDrawer();
		}
	};
	const ctProps: Omit<TooltipProps, "children"> = {
		title: `Click to ${isDrawerOpen ? "CLOSE." : "OPEN."}`,
		placement: "left",
	};

	if (asIcon) {
		// When asIcon is true, children is required due to our type definition
		return (
			<Box>
				<CoolTip {...ctProps}>
					<IconButton size="small" onClick={handleClick} {...iconButtonProps}>
						{children || (
							<IconToggle
								isExpanded={isDrawerOpen}
								transitionDuration=".4s"
								icon={<CaretCircleDoubleRight weight="fill" color="var(--primary-main)" />}
								rotationDirection={180}
							/>
						)}
					</IconButton>
				</CoolTip>
			</Box>
		);
	}

	// For regular button, self-closing if no children
	return (
		<Box>
			<CoolTip {...ctProps}>
				<Button onClick={handleClick} {...buttonProps}>
					{children || "Toggle Drawer"}
				</Button>
			</CoolTip>
		</Box>
	);
};

export default SidebarTrigger;
