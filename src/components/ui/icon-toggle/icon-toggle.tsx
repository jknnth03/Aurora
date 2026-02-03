import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { SvgIconProps } from "@mui/material/SvgIcon";

type RotationDirection = number;

interface RotatingIconProps {
	expanded: boolean;
	rotationAngle: RotationDirection;
	defaultAngle: RotationDirection;
	transitionDuration: string;
}

const RotatingIconWrapper = styled("div")<RotatingIconProps>(
	({ expanded, rotationAngle, defaultAngle, transitionDuration }) => ({
		display: "inline-flex",
		transform: expanded ? `rotate(${rotationAngle}deg)` : `rotate(${defaultAngle}deg)`,
		transition: `transform ${transitionDuration} ease-in-out`,
	})
);

export interface ArrowToggleProps {
	// State control
	isExpanded?: boolean;
	onToggle?: (e?: React.MouseEvent<HTMLButtonElement>) => void;

	// Customization
	icon?: React.ReactElement<SvgIconProps>;
	rotationDirection?: RotationDirection;
	defaultOrientation?: RotationDirection;
	transitionDuration?: string;

	// Additional props
	className?: string;
	style?: React.CSSProperties;
}

const IconToggle: React.FC<ArrowToggleProps> = ({
	isExpanded = false,
	onToggle,
	icon = <KeyboardArrowRight />,
	rotationDirection = 90,
	defaultOrientation = 0,
	transitionDuration = "0.2s",
	className,
	style,
	...props
}) => {
	// Internal state if not controlled from parent
	const [internalExpanded, setInternalExpanded] = useState(false);

	// Determine if we're using internal or external state
	const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;

	const handleClick = () => {
		if (onToggle) {
			onToggle();
		} else {
			setInternalExpanded(!internalExpanded);
		}
	};

	return (
		<RotatingIconWrapper
			expanded={expanded}
			rotationAngle={rotationDirection}
			defaultAngle={defaultOrientation}
			transitionDuration={transitionDuration}
			onClick={handleClick}
			className={className}
			style={style}
			{...props}
		>
			{React.cloneElement(icon, {
				fontSize: icon.props.fontSize || "12px",
			})}
		</RotatingIconWrapper>
	);
};

export default IconToggle;
