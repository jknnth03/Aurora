// slices.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { PaletteMode } from "@mui/material/styles";
import { CONFIG } from "../../config/config";
import { getCookie, setCookie } from "../../utils/cookie";
import { decrypt } from "../../utils/crypto";

// Define TypeScript interface for the slice state
export interface ThemeSliceState {
	mode: PaletteMode;
	color: string;
	isDrawerOpen: boolean;
}

// Get initial values from cookies or use defaults
const getInitialMode = (): PaletteMode => {
	const savedMode = getCookie(CONFIG.STORAGE.DARK_MODE.LABEL);
	// Type guard to ensure valid PaletteMode
	return savedMode === "light" || savedMode === "dark" ? savedMode : "light";
};

const getInitialDrawerState = (): boolean => {
	try {
		const savedState = getCookie(CONFIG.STORAGE.DRAWER.LABEL);
		// Handle the case where the cookie might not exist yet
		return savedState ? JSON.parse(savedState) === true : false;
	} catch (error) {
		//console.error("Error parsing drawer state from cookie:", error);
		return false;
	}
};

const getInitialColor = (): string => {
	const savedColor = getCookie(CONFIG.STORAGE.SYSTEM_COLOR.LABEL);
	if (savedColor) {
		try {
			const decryptedColor = decrypt(savedColor);
			return typeof decryptedColor === "string" ? decryptedColor : CONFIG.DEFAULT_COLOR;
		} catch (error) {
			//console.error("Error decrypting saved color:", error);
			return CONFIG.DEFAULT_COLOR;
		}
	}
	return CONFIG.DEFAULT_COLOR;
};

// Define initial state with type
const initialState: ThemeSliceState = {
	mode: getInitialMode(),
	color: getInitialColor(),
	isDrawerOpen: getInitialDrawerState(),
};

// Create the slice with proper typing
const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		toggleMode: (state, action: PayloadAction<PaletteMode>) => {
			state.mode = action.payload;
		},

		selectColor: (state, action: PayloadAction<string>) => {
			state.color = action.payload;
		},

		toggleDrawer: (state, action: PayloadAction<boolean | undefined>) => {
			// Calculate the new state first
			const newDrawerState = action.payload !== undefined ? action.payload : !state.isDrawerOpen;

			// Set the cookie with the string representation of the boolean
			setCookie(CONFIG.STORAGE.DRAWER.LABEL, JSON.stringify(newDrawerState), { expires: 30 });

			// Update the state
			state.isDrawerOpen = newDrawerState;
		},
	},
});

// Export actions and reducer
export const { toggleMode, selectColor, toggleDrawer } = themeSlice.actions;
export default themeSlice.reducer;
