import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { X } from "@phosphor-icons/react";
import moment from "moment";
import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { stringToColor } from "../../../utils/avatar";
import { getCookie } from "../../../utils/cookie";
import CoolTip from "../cool-tip/cool-tip";
import { Bookmark } from "./bookmark-slice";
import "./bookmark.scss";
import { findModuleByAlias } from "../../../config/modules/modulesUtility";
interface BookmarkCardItemProps {
	bookmark: Bookmark;
	onContextMenu: (event: React.MouseEvent, bookmark: Bookmark) => void;
	onRemove: (event: React.MouseEvent, name: string) => void;
}

const BookmarkCardItem: React.FC<BookmarkCardItemProps> = memo(({ bookmark, onContextMenu, onRemove }) => {
	// Memoize module lookup to prevent unnecessary recalculations
	const module = useMemo(() => findModuleByAlias(bookmark.name), [bookmark.name]);

	// Memoize icon color calculation
	const iconColor = useMemo(() => stringToColor(module?.ALIAS || ""), [module?.ALIAS]);

	// Memoize the path to prevent unnecessary re-renders
	const linkPath = useMemo(() => module?.PATH || "/", [module?.PATH]);

	// Memoize event handlers
	const handleContextMenu = useCallback(
		(event: React.MouseEvent) => {
			onContextMenu(event, bookmark);
		},
		[onContextMenu, bookmark]
	);

	const handleRemove = useCallback(
		(event: React.MouseEvent) => {
			onRemove(event, bookmark.name);
		},
		[onRemove, bookmark.name]
	);

	// Memoize the sx prop to prevent object recreation
	const iconSx = useMemo(
		() => ({
			svg: {
				color: iconColor,
				fill: iconColor,
				stroke: iconColor,
			},
		}),
		[iconColor]
	);

	// Memoize ListItemText props
	const listItemTextProps = useMemo(
		() => ({
			primary: {
				noWrap: true,
				variant: "caption" as const,
			},
		}),
		[]
	);

	const lastVisit = useMemo(() => {
		const cookieValue = getCookie("last-visit" + module?.PATH);
		if (!cookieValue) return "Not visited";

		// Try to parse as ISO format first (new format)
		let parsedDate = moment(cookieValue, moment.ISO_8601, true);

		// If invalid, try parsing as old JavaScript Date string format
		if (!parsedDate.isValid()) {
			// Convert to Date first, then get ISO string to avoid moment deprecation warning
			try {
				const dateObj = new Date(cookieValue);
				if (!isNaN(dateObj.getTime())) {
					parsedDate = moment(dateObj.toISOString());
				}
			} catch (error) {
				// If all parsing fails, return fallback
				return "Not visited";
			}
		}

		return parsedDate.isValid() ? parsedDate.fromNow() : "Not visited";
	}, [module?.PATH]);

	return (
		<ListItem disableGutters component={Link} to={linkPath} className="bookmark-card__list-item">
			<CoolTip title={lastVisit} placement="right">
				<ListItemButton
					className="bookmark-card__list-button"
					onContextMenu={handleContextMenu}
					disableRipple
					disableTouchRipple
					sx={{ borderRadius: 1, px: 2 }}
				>
					<ListItemIcon className="bookmark-card__list-icon" sx={iconSx}>
						{module?.ICON_ON}
					</ListItemIcon>
					<ListItemText primary={bookmark.name} slotProps={listItemTextProps} />
					<ListItemIcon
						className="bookmark-card__list-icon"
						onClick={handleRemove}
						sx={{ display: "flex", flexDirection: "row-reverse" }}
					>
						<X size={16} color="var(--warning-main)" />
					</ListItemIcon>
				</ListItemButton>
			</CoolTip>
		</ListItem>
	);
});

BookmarkCardItem.displayName = "BookmarkCardItem";

export default BookmarkCardItem;
