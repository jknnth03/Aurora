// src/features/slices/bookmark-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cookieExists, getCookie, removeCookie, setCookie } from "../../../utils/cookie";
import { RootState } from "../../../app/store";

// Define the Bookmark interface
export interface Bookmark {
	name: string;
	url: string;
}

// Cookie name for storing bookmarks
const BOOKMARKS_COOKIE = "user_bookmarks";

// Maximum number of bookmarks to store
const MAX_BOOKMARKS = 5;

// Helper function to load bookmarks from cookie
const loadBookmarksFromCookie = (): Bookmark[] => {
	if (cookieExists(BOOKMARKS_COOKIE)) {
		try {
			const bookmarksJson = getCookie(BOOKMARKS_COOKIE);
			const savedBookmarks = JSON.parse(bookmarksJson) as Bookmark[];
			return Array.isArray(savedBookmarks) ? savedBookmarks : [];
		} catch (error) {
			//console.error("Error loading bookmarks from cookie:", error);
			return [];
		}
	}
	return [];
};

// Helper function to save bookmarks to cookie
const saveBookmarksToCookie = (bookmarks: Bookmark[], cookieOptions = {}): void => {
	const options = { expires: 30, path: "/", ...cookieOptions };

	try {
		if (bookmarks.length > 0) {
			const bookmarksJson = JSON.stringify(bookmarks);
			setCookie(BOOKMARKS_COOKIE, bookmarksJson, options);
		} else if (cookieExists(BOOKMARKS_COOKIE)) {
			// If bookmarks array is empty, remove the cookie
			removeCookie(BOOKMARKS_COOKIE);
		}
	} catch (error) {
		//console.error("Error saving bookmarks to cookie:", error);
	}
};

export interface BookmarksState {
	bookmarks: Bookmark[];
}

// Initialize state with bookmarks from cookie
const initialState: BookmarksState = {
	bookmarks: loadBookmarksFromCookie(),
};

export const bookmarkSlice = createSlice({
	name: "bookmark",
	initialState,
	reducers: {
		addBookmark: (state, action: PayloadAction<{ name: string; url: string }>) => {
			const { name, url } = action.payload;

			// Skip if missing name or URL
			if (!name || !url) return;

			// Check if already exists
			const exists = state.bookmarks.some((bookmark) => bookmark.name === name);
			if (exists) return;

			// Add bookmark
			state.bookmarks.push({ name, url });

			// Apply FIFO if exceeding max bookmarks
			if (state.bookmarks.length > MAX_BOOKMARKS) {
				state.bookmarks = state.bookmarks.slice(1);
			}

			// Save to cookie
			saveBookmarksToCookie(state.bookmarks);
		},
		removeBookmark: (state, action: PayloadAction<string>) => {
			const name = action.payload;
			const index = state.bookmarks.findIndex((bookmark) => bookmark.name === name);

			// Return if not found
			if (index === -1) return;

			// Remove bookmark
			state.bookmarks.splice(index, 1);

			// Save to cookie
			saveBookmarksToCookie(state.bookmarks);
		},
		clearBookmarks: (state) => {
			state.bookmarks = [];

			// Remove cookie
			if (cookieExists(BOOKMARKS_COOKIE)) {
				removeCookie(BOOKMARKS_COOKIE);
			}
		},
	},
});

export const { addBookmark, removeBookmark, clearBookmarks } = bookmarkSlice.actions;

// IMPORTANT: These selectors must match how the reducer is registered in your store
export const selectBookmarks = (state: RootState) => state.bookmark?.bookmarks || [];
export const selectIsBookmarked = (state: RootState, name: string) =>
	state.bookmark?.bookmarks?.some((bookmark) => bookmark.name === name) || false;
export const selectBookmark = (state: RootState, name: string) =>
	state.bookmark?.bookmarks?.find((bookmark) => bookmark.name === name);

export default bookmarkSlice.reducer;
