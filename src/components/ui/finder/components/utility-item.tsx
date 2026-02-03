import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { memo, ReactNode } from "react";

export const toolname = "MousekaTools ᵇʸ ᵍʳᵉᵍ"; // Don't change this, it has sentimental value from MIS, especially the name Mousekatool.
export const tooldescription = `${toolname}  — are small, magical utilities for everyday tasks — just like calling “Oh Toodles!” but on your screen.`;
export interface UtilityItem {
	key: string;
	name?: string;
	description: ReactNode;
	component: React.ComponentType;
	searchableText: string;
	listItemProps?: React.ComponentProps<typeof ListItemButton>;
}

// Memoized utility item component to prevent unnecessary re-renders
export const UtilityListItem = memo(({ item, index }: { item: UtilityItem; index: number }) => {
	const UtilityComponent = item.component;

	// Merge default props with custom props
	const listItemButtonProps = {
		component: "div" as const,
		sx: { cursor: item.listItemProps?.onClick ? "pointer" : "default", borderRadius: 1 },
		disableRipple: !item.listItemProps?.onClick,
		disableTouchRipple: !item.listItemProps?.onClick,
		...item.listItemProps, // Spread custom props to override defaults
	};

	return (
		<ListItem key={`${item.key}-${index}`} disablePadding>
			<ListItemButton {...listItemButtonProps}>
				<ListItemIcon>
					<UtilityComponent />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography variant="body2" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
							{item.name}
						</Typography>
					}
					secondary={
						<>
							<Typography variant="caption" color="text.secondary">
								{item.description}
							</Typography>
							<Typography
								variant="caption"
								display="block"
								sx={{ color: "text.disabled", mt: 0.5, fontFamily: "monospace" }}
							>
								Type: {toolname}
							</Typography>
						</>
					}
				/>
			</ListItemButton>
		</ListItem>
	);
});

UtilityListItem.displayName = "UtilityListItem";
