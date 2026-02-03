import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { Backspace, Heart } from "@phosphor-icons/react";
import { enqueueSnackbar } from "notistack";
import React, { useCallback, useMemo } from "react";
import ContextMenu, { ContextMenuItem } from "../context-menu/context-menu";
import useContextMenu from "../context-menu/useContextMenu";
import CoolTip from "../cool-tip/cool-tip";
import { Bookmark } from "./bookmark-slice";
import { useBookmark } from "./useBookmark";

import "./bookmark.scss";
import BookmarkCardItem from "./bookmark-card-item";

const BookmarkCard: React.FC = () => {
	const { bookmarks, removeBookmark, clearBookmarks } = useBookmark();
	const { contextMenu, handleContextMenu, handleCloseContextMenu } = useContextMenu<Bookmark>();

	// Memoize context menu items function
	const getContextMenuItems = useCallback(
		(bookmark: Bookmark): Array<ContextMenuItem<unknown>> => [
			{
				id: `remove-bookmark`,
				label: `Remove ${bookmark.name}`,
				icon: <Heart size={18} weight="bold" color="var(--error-main)" />,
				onClick: () => {
					removeBookmark(bookmark.name);
					enqueueSnackbar(`${bookmark.name} removed from bookmarks`, { variant: "success" });
				},
			},
		],
		[removeBookmark]
	);

	// Memoize event handlers
	const handleRemoveBookmark = useCallback(
		(event: React.MouseEvent, name: string) => {
			event.preventDefault();
			event.stopPropagation();
			removeBookmark(name);
			enqueueSnackbar(`${name} removed from bookmarks`, { variant: "success" });
		},
		[removeBookmark]
	);

	const handleClearBookmarks = useCallback(() => {
		clearBookmarks();
		enqueueSnackbar("All bookmarks cleared", { variant: "success" });
	}, [clearBookmarks]);

	// Memoize the empty state to prevent recreation
	const emptyState = useMemo(
		() => (
			<Box className="bookmark-card__empty-state">
				<Heart size={32} />
				<Typography variant="body2" color="text.secondary" className="bookmark-card__empty-state-text">
					No bookmarks yet. Add some.
				</Typography>
			</Box>
		),
		[]
	);

	// Memoize the bookmarks list
	const bookmarksList = useMemo(() => {
		if (bookmarks.length === 0) {
			return emptyState;
		}

		return (
			<Box className="bookmark-card__list-container">
				<List dense={true} sx={{ padding: 0 }}>
					{bookmarks.map((bookmark) => (
						<BookmarkCardItem
							key={bookmark.name}
							bookmark={bookmark}
							onContextMenu={handleContextMenu}
							onRemove={handleRemoveBookmark}
						/>
					))}
				</List>
			</Box>
		);
	}, [bookmarks, emptyState, handleContextMenu, handleRemoveBookmark]);

	// Memoize the header action
	const headerAction = useMemo(
		() => (
			<CoolTip title="Clear my bookmarks">
				<IconButton onClick={handleClearBookmarks}>
					<Backspace />
				</IconButton>
			</CoolTip>
		),
		[handleClearBookmarks]
	);

	// Memoize the header avatar
	const headerAvatar = useMemo(() => <Heart weight="fill" color="var(--error-light)" size={20} />, []);

	return (
		<Card className="bookmark-card">
			<CardHeader
				className="bookmark-card__header"
				title="Your Bookmarks"
				avatar={headerAvatar}
				subheader="Quick access to your favorite modules"
				action={headerAction}
			/>
			<CardContent className="bookmark-card__content">{bookmarksList}</CardContent>
			<ContextMenu<Bookmark>
				contextMenu={contextMenu}
				menuItems={getContextMenuItems}
				onClose={handleCloseContextMenu}
				slotProps={{}}
			/>
		</Card>
	);
};

export default BookmarkCard;
