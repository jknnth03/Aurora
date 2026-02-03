import React, { forwardRef, ButtonHTMLAttributes } from "react";
import usePaletteTheme from "../../../hooks/useTheme";
import "./ModeSwitch.scss";
import CoolTip from "../cool-tip/cool-tip";

type size = "xxxs" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

// Extend ButtonHTMLAttributes to add all standard button props
interface ModeSwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	size?: size;
}

// Use forwardRef to allow refs to be passed to the component
const LightDarkModeSwitch = forwardRef<HTMLButtonElement, ModeSwitchProps>(
	({ size = "md", className = "", ...buttonProps }, ref) => {
		const { mode, handleModeChange } = usePaletteTheme();

		// Handle theme toggle click
		const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			handleModeChange(mode === "light" ? "dark" : "light");

			// Call the original onClick handler if provided
			if (buttonProps.onClick) {
				buttonProps.onClick(e);
			}
		};

		return (
			<CoolTip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`} placement="top">
				<div className="mode-switch-container">
					<button
						ref={ref}
						className={`mode-switch mode-switch-${size} ${mode} ${className}`}
						onClick={onClick}
						aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
						title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
						{...buttonProps} // Spread all other button props
					>
						<div className="switch-track">
							<div className="celestial-body">
								<div className="sun-core"></div>
								<div className="moon-crater crater-1"></div>
								<div className="moon-crater crater-2"></div>
								<div className="moon-crater crater-3"></div>
							</div>

							<div className="stars-container">
								<div className="star star-1"></div>
								<div className="star star-2"></div>
								<div className="star star-3"></div>
								<div className="star star-4"></div>
								<div className="star star-5"></div>
							</div>

							<div className="clouds-container">
								<div className="cloud cloud-1"></div>
								<div className="cloud cloud-2"></div>
							</div>

							<div className="rays-container">
								<div className="ray ray-1"></div>
								<div className="ray ray-2"></div>
								<div className="ray ray-3"></div>
								<div className="ray ray-4"></div>
								<div className="ray ray-5"></div>
								<div className="ray ray-6"></div>
							</div>
						</div>
					</button>
				</div>
			</CoolTip>
		);
	}
);

// Add display name for better debugging
LightDarkModeSwitch.displayName = "LightDarkModeSwitch";

export default LightDarkModeSwitch;
