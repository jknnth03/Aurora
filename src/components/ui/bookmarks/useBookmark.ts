// src/hooks/useBookmark.ts
import { useSelector, useDispatch } from "react-redux";
import {
	addBookmark as addBookmarkAction,
	removeBookmark as removeBookmarkAction,
	clearBookmarks as clearBookmarksAction,
	selectBookmarks,
	Bookmark,
} from "./bookmark-slice";
import { useCallback } from "react";

export const useBookmark = () => {
	const dispatch = useDispatch();

	// Get all bookmarks at the hook level
	const bookmarks = useSelector(selectBookmarks);

	const addBookmark = useCallback(
		(name: string, url: string) => {
			if (!name || !url) {
				return;
			}

			dispatch(addBookmarkAction({ name, url }));
		},
		[dispatch]
	);

	const removeBookmark = useCallback(
		(name: string) => {
			dispatch(removeBookmarkAction(name));
		},
		[dispatch]
	);

	const clearBookmarks = useCallback(() => {
		dispatch(clearBookmarksAction());
	}, [dispatch]);

	// Get bookmark status directly using the bookmarks from state
	const isBookmarked = useCallback(
		(name: string): boolean => {
			return bookmarks.some((bookmark) => bookmark.name === name);
		},
		[bookmarks]
	);

	const getBookmark = useCallback(
		(name: string): Bookmark | undefined => {
			return bookmarks.find((bookmark) => bookmark.name === name);
		},
		[bookmarks]
	);

	return {
		bookmarks,
		addBookmark,
		removeBookmark,
		clearBookmarks,
		isBookmarked,
		getBookmark,
	};
};
