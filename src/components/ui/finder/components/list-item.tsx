import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { HandTap, Heart, MouseRightClick } from "@phosphor-icons/react";
import { memo, ReactNode, useCallback, useMemo } from "react";
import { PhosphorIcon } from "../../../../hooks/usePhosphorIcon";
import { stringToColor } from "../../../../utils/avatar";
import CoolTip from "../../cool-tip/cool-tip";
import { toolname } from "./utility-item";

// Base interface for all list items
export interface BaseListItem {
	key: string;
	name?: string;
	description: ReactNode;
	searchableText: string;
}

// Module-specific list item
export interface ModuleListItem extends BaseListItem {
	type: "module";
	module: {
		KEY: string;
		ALIAS: string;
		DESCRIPTION?: string;
		PATH: string;
		ICON_ON: string;
	};
	fullPath: string;
	parentKey?: string;
	depth: number;
	isBookmarked?: boolean;
	onModuleClick?: (item: ModuleListItem) => void;
	onContextMenu?: (event: React.MouseEvent, module: ModuleListItem["module"]) => void;
}

// Utility-specific list item
export interface UtilityListItem extends BaseListItem {
	type: "utility";
	component: React.ComponentType;
	listItemProps?: React.ComponentProps<typeof ListItemButton>;
}

// Union type for all possible list items
export type UnifiedListItem = ModuleListItem | UtilityListItem;

// Props for the unified component
interface UnifiedListItemProps {
	item: UnifiedListItem;
	index: number;
}

// Main unified list item component
export const UnifiedListItemComponent = memo(({ item, index }: UnifiedListItemProps) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Memoized icon color for modules
	const iconColor = useMemo(() => {
		if (item.type === "module") {
			return stringToColor(item.module?.ALIAS || "");
		}
		return undefined;
	}, [item]);

	// Memoized click handler
	const handleClick = useCallback(() => {
		if (item.type === "module" && item.onModuleClick) {
			item.onModuleClick(item);
		}
		// Utility items handle their own clicks through listItemProps
	}, [item]);

	// Memoized context menu handler
	const handleContextMenu = useCallback(
		(event: React.MouseEvent) => {
			if (item.type === "module" && item.onContextMenu) {
				item.onContextMenu(event, item.module);
			}
		},
		[item]
	);

	// Determine button props based on item type
	const buttonProps = useMemo(() => {
		const baseProps = {
			sx: { borderRadius: 1 },
			disableRipple: true,
			disableTouchRipple: true,
		};

		if (item.type === "module") {
			return {
				...baseProps,
				onClick: handleClick,
				onContextMenu: handleContextMenu,
			};
		} else {
			// Utility item - merge with custom props
			return {
				...baseProps,
				component: "div" as const,
				sx: {
					...baseProps.sx,
					cursor: item.listItemProps?.onClick ? "pointer" : "default",
				},
				disableRipple: !item.listItemProps?.onClick,
				disableTouchRipple: !item.listItemProps?.onClick,
				...item.listItemProps, // Spread custom props to override defaults
			};
		}
	}, [item, handleClick, handleContextMenu]);

	// Render the appropriate icon
	const renderIcon = () => {
		if (item.type === "module") {
			return <PhosphorIcon icon={item.module.ICON_ON} size={16} color={iconColor} />;
		} else {
			const UtilityComponent = item.component;
			return <UtilityComponent />;
		}
	};

	// Render primary text
	const renderPrimaryText = () => {
		const displayName = item.type === "module" ? item.module.ALIAS : item.name;
		return (
			<Typography variant="body2" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
				{displayName}
			</Typography>
		);
	};

	// Render secondary text
	const renderSecondaryText = () => {
		if (item.type === "module") {
			return (
				<>
					<Typography variant="caption" color="text.secondary">
						{item.module.DESCRIPTION || "No description available"}
					</Typography>
					<Typography
						variant="caption"
						display="block"
						sx={{ color: "text.disabled", mt: 0.5, fontFamily: "monospace" }}
					>
						Path: {item.fullPath}
					</Typography>
				</>
			);
		} else {
			return (
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
			);
		}
	};

	// Render trailing icons (only for modules)
	const renderTrailingIcons = () => {
		if (item.type === "module") {
			return (
				<ListItemIcon sx={{ display: "flex", gap: 2 }}>
					<CoolTip title={isMobile ? "Hold item to see more" : "You can right click this item"}>
						{isMobile ? <HandTap /> : <MouseRightClick weight="fill" />}
					</CoolTip>
					<CoolTip title={item.isBookmarked ? "This item is bookmarked" : "This item is not bookmarked"}>
						<Heart
							weight={item.isBookmarked ? "fill" : undefined}
							color={item.isBookmarked ? "var(--error-light)" : undefined}
						/>
					</CoolTip>
				</ListItemIcon>
			);
		}
		return null;
	};

	return (
		<ListItem key={`${item.key}-${index}`} disablePadding>
			<ListItemButton {...buttonProps}>
				<ListItemIcon>{renderIcon()}</ListItemIcon>
				<ListItemText primary={renderPrimaryText()} secondary={renderSecondaryText()} />
				{renderTrailingIcons()}
			</ListItemButton>
		</ListItem>
	);
});

UnifiedListItemComponent.displayName = "UnifiedListItemComponent";

// Helper function to convert flat modules to unified format
export const createModuleListItem = (
	item: {
		module: ModuleListItem["module"];
		fullPath: string;
		searchableText: string;
		parentKey?: string;
		depth: number;
	},
	isBookmarked: boolean,
	onModuleClick: (item: ModuleListItem) => void,
	onContextMenu: (event: React.MouseEvent, module: ModuleListItem["module"]) => void
): ModuleListItem => ({
	type: "module",
	key: item.module.KEY,
	name: item.module.ALIAS,
	description: item.module.DESCRIPTION || "No description available",
	searchableText: item.searchableText,
	module: item.module,
	fullPath: item.fullPath,
	parentKey: item.parentKey,
	depth: item.depth,
	isBookmarked,
	onModuleClick,
	onContextMenu,
});

// Helper function to convert utility items to unified format
export const createUtilityListItem = (item: {
	key: string;
	name?: string;
	description: ReactNode;
	component: React.ComponentType;
	searchableText: string;
	listItemProps?: React.ComponentProps<typeof ListItemButton>;
}): UtilityListItem => ({
	type: "utility",
	key: item.key,
	name: item.name,
	description: item.description,
	searchableText: item.searchableText,
	component: item.component,
	listItemProps: item.listItemProps,
});

export { toolname };
