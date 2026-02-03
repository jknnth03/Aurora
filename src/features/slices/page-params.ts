// pageStateSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the page state object type
export interface PageStateParams {
	[key: string]: string;
}

// Define interfaces for our state and action payloads
interface PagesState {
	[pageName: string]: PageStateParams;
}

interface PageStateState {
	pages: PagesState;
	pageOrder: string[];
}

interface SetPageStatePayload {
	pageName: string;
	params: PageStateParams;
}

interface UpdatePageStatePayload {
	pageName: string;
	params: Partial<PageStateParams>;
}

interface ClearPageStatePayload {
	pageName: string;
}

// Maximum number of page states to keep
const MAX_PAGE_STATES = 5;

// Initial state
const initialState: PageStateState = {
	pages: {},
	pageOrder: [],
};

// Helper function to update the page order and remove oldest if exceeding max
const updatePageOrderAndTrim = (state: PageStateState, pageName: string) => {
	state.pageOrder = state.pageOrder.filter((name) => name !== pageName);

	state.pageOrder.push(pageName);

	if (state.pageOrder.length > MAX_PAGE_STATES) {
		const oldestPage = state.pageOrder.shift(); // Remove oldest
		if (oldestPage) {
			delete state.pages[oldestPage]; // Remove its state
		}
	}
};

// Create the slice
export const pageParams = createSlice({
	name: "pageParams",
	initialState,
	reducers: {
		setPageState: (state, action: PayloadAction<SetPageStatePayload>) => {
			const { pageName, params } = action.payload;

			state.pages[pageName] = params;

			updatePageOrderAndTrim(state, pageName);
		},
		updatePageState: (state, action: PayloadAction<UpdatePageStatePayload>) => {
			const { pageName, params } = action.payload;

			if (!state.pages[pageName]) {
				state.pages[pageName] = {};
			}

			const filteredParams = Object.fromEntries(
				Object.entries(params).filter(([_, v]) => v !== undefined)
			) as PageStateParams;
			state.pages[pageName] = {
				...state.pages[pageName],
				...filteredParams,
			};

			updatePageOrderAndTrim(state, pageName);
		},
		clearPageState: (state, action: PayloadAction<ClearPageStatePayload>) => {
			const { pageName } = action.payload;

			delete state.pages[pageName];

			state.pageOrder = state.pageOrder.filter((name) => name !== pageName);
		},
		resetAllParams: (state) => {
			// Reset everything back to initial state
			state.pages = {}; // Create a new empty object
			state.pageOrder = []; // Create a new empty array
		},
	},
});

export const { setPageState, updatePageState, clearPageState, resetAllParams } = pageParams.actions;

export default pageParams.reducer;
