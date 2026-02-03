import Typography from "@mui/material/Typography";
import React, { memo, forwardRef, useImperativeHandle } from "react";
import { useLastVisit } from "./useLastVisit";

type LastVisitTextProps = {
	path: string;
	className?: string;
	variant?: "caption" | "body2" | "body1";
	fontSize?: number;
};

export type LastVisitTextRef = {
	triggerUpdate: () => void;
	createVisit: () => void;
};

const LastVisitText = memo(
	forwardRef<LastVisitTextRef, LastVisitTextProps>(
		({ path, className = "sidebar__last-visit", variant = "caption", fontSize = 9 }, ref) => {
			const { lastVisit, triggerUpdate, createVisit } = useLastVisit(path);

			// Expose triggerUpdate and createVisit via ref
			useImperativeHandle(
				ref,
				() => ({
					triggerUpdate,
					createVisit,
				}),
				[triggerUpdate, createVisit]
			);

			// Don't render if no last visit
			if (!lastVisit) {
				return null;
			}

			return (
				<Typography
					className={className}
					variant={variant}
					fontSize={fontSize}
					// aria-describedby={`Last visited ${lastVisit}`}
					aria-label={`Last visited ${lastVisit}`}
					title={`Last visited ${lastVisit}`}
				>
					{lastVisit}
				</Typography>
			);
		}
	)
);

LastVisitText.displayName = "LastVisitText";

export default LastVisitText;
