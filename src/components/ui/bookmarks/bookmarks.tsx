import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Heart, Trash } from "@phosphor-icons/react";
import { enqueueSnackbar } from "notistack";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router";
import { stringToColor } from "../../../utils/avatar";
import { cookieExists, getCookie, setCookie } from "../../../utils/cookie";
import ContextMenu, { ContextMenuItem } from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
import CoolTip from "../cool-tip/cool-tip";
import { Bookmark } from "./bookmark-slice";
import { useBookmark } from "./useBookmark";
import { findModuleByAlias } from "../../../config/modules/modulesUtility";

// Define the ref type for external access
export interface BookmarksRef {
	setAreBookmarksSeen: (value: boolean | ((prev: boolean) => boolean)) => void;
	toggleBookmarksVisibility: () => void;
}

// You'll need to import or define BM component
// For example:
// Or create your own component

// Define a dummy type for the toggle button context menu
// This avoids the need to use the Bookmark type which requires an item parameter
interface BookmarkToggleContextItem {
	id: string;
}

// Separate bookmark toggle button component for reuse
export const BookmarkToggleButton = ({ onClick }: { onClick: IconButtonProps["onClick"] }) => {
	const { bookmarks, clearBookmarks } = useBookmark();
	// Use a separate context menu instance with a different type
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu<BookmarkToggleContextItem>();
	const hasBookmarks = bookmarks.length > 0;
	// Create a dummy item to pass to handleContextMenu
	const dummyItem: BookmarkToggleContextItem = { id: "toggle-button" };

	const getContextMenuItems = (): Array<ContextMenuItem<unknown>> => [
		{
			id: `clear-all-bookmarks`,
			label: "Clear all bookmarks",
			disabled: !hasBookmarks,
			icon: <Trash size={18} weight="bold" color="var(--error-main)" />,
			onClick: () => {
				clearBookmarks();
				enqueueSnackbar("All bookmarks cleared", { variant: "success" });
			},
		},
	];

	return (
		<>
			<CoolTip title={hasBookmarks ? `Bookmarks (${bookmarks.length})` : "No bookmarks yet."}>
				<IconButton
					size="small"
					onClick={onClick}
					onContextMenu={(event) => handleContextMenu(event, dummyItem)}
				>
					<Heart
						weight={hasBookmarks ? "fill" : "bold"}
						color={hasBookmarks ? "var(--error-light)" : undefined}
					/>
				</IconButton>
			</CoolTip>
			<ContextMenu<BookmarkToggleContextItem>
				contextMenu={contextMenu}
				menuItems={getContextMenuItems}
				onClose={handleCloseContextMenu}
				slotProps={{}}
			/>
		</>
	);
};
const Bookmarks = forwardRef<BookmarksRef>((props, ref) => {
	const { bookmarks, removeBookmark } = useBookmark();
	const storedBMStatus = cookieExists("show-bm") ? JSON?.parse(getCookie("show-bm")) : false;
	const [areBookmarksSeen, setAreBookmarksSeen] = useState<boolean>(storedBMStatus || false);
	const navigate = useNavigate();
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu<Bookmark>();

	// Toggle bookmarks visibility
	const toggleBookmarksVisibility = () => {
		setAreBookmarksSeen((prev) => !prev);
		setCookie("show-bm", (!areBookmarksSeen).toString());
	};

	// Expose functions via ref for external access
	useImperativeHandle(ref, () => ({
		setAreBookmarksSeen,
		toggleBookmarksVisibility,
	}));

	// Get context menu items for a bookmark
	const getContextMenuItems = (bookmark: Bookmark): Array<ContextMenuItem<unknown>> => [
		{
			id: `remove-bookmark`,
			label: `Remove ${bookmark.name}`,
			icon: <Trash size={18} weight="bold" color="var(--error-main)" />,
			onClick: () => {
				removeBookmark(bookmark.name);
				enqueueSnackbar(`${bookmark.name} removed from bookmarks`, { variant: "success" });
			},
		},
		// {
		// 	id: `clear-all-bookmarks`,
		// 	label: "Clear all bookmarks",
		// 	icon: <Trash size={18} weight="bold" color="var(--error-main)" />,
		// 	onClick: () => {
		// 		clearBookmarks();
		// 		enqueueSnackbar("All bookmarks cleared", { variant: "success" });
		// 	},
		// },
	];

	// Handle navigation to a bookmarked URL
	const handleBookmarkClick = (url: string) => {
		navigate(url);
	};

	// If no bookmarks, show a message
	if (!bookmarks || bookmarks.length === 0) {
		return (
			<Collapse in={areBookmarksSeen} orientation="horizontal">
				<Box height={"100%"} minWidth={180} display={"flex"} alignItems={"center"} gap={1}>
					<Typography variant="caption" color="text.secondary">
						No bookmarks yet, add some.
					</Typography>
				</Box>
			</Collapse>
		);
	}

	return (
		<>
			<Collapse in={areBookmarksSeen} orientation="horizontal">
				<Box display={"flex"} gap={1} height={"100%"}>
					{bookmarks.map((bookmark, index) => {
						const module = findModuleByAlias(bookmark.name);
						const iconColor = stringToColor(module?.ALIAS || "");
						return (
							<CoolTip key={index} title={module?.ALIAS + " bookmark, navigate."}>
								<Box>
									<IconButton
										size="small"
										sx={{
											svg: {
												color: iconColor,
												fill: iconColor,
												stroke: iconColor,
											},
										}}
										onClick={() => handleBookmarkClick(bookmark.url)}
										onContextMenu={(event) => handleContextMenu(event, bookmark)}
									>
										{module?.ICON_ON}
									</IconButton>
								</Box>
							</CoolTip>
						);
					})}
				</Box>

				<ContextMenu<Bookmark>
					contextMenu={contextMenu}
					menuItems={getContextMenuItems}
					onClose={handleCloseContextMenu}
					slotProps={{}}
				/>
			</Collapse>
		</>
	);
});

export default Bookmarks;
