// theme.d.ts
import "@mui/material/Tooltip";
import { ReactNode } from "react";

declare module "@mui/material/Tooltip" {
	interface TooltipProps {
		transparent?: boolean;
		variant?: "primary" | "error" | "success" | "warning" | "info";
		icon?: ReactNode;
	}
}
