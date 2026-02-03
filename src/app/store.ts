import { configureStore } from "@reduxjs/toolkit";

import themeSlice from "../features/slices/theme-slice"; // Adjust the path based on your project structure
import auth from "../features/slices/auth-slice"; // Adjust the path based on your project structure
import { api } from "../features/api/aurora/index.api";
import { authMiddleware } from "./auth-middleware";
import { cedarApi } from "../features/api/foreign-api/sedar.api";
import pageParams from "../features/slices/page-params";
import bookmarkReducer from "../components/ui/bookmarks/bookmark-slice";
import qaDashboardReducer from "../features/slices/qaDashboard-slice";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("qaDashboard");
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state", err);
    return undefined;
  }
};

const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("qaDashboard", serializedState);
  } catch (err) {
    console.error("Failed to save state", err);
  }
};

const preloadedState = {
  qaDashboard: loadState() || undefined,
};

const store = configureStore({
  reducer: {
    themeSlice: themeSlice,

    bookmark: bookmarkReducer,

    pageParams: pageParams,

    auroraApi: api.reducer,
    auth: auth,
    qaDashboard: qaDashboardReducer,
    // [ymirApi.reducerPath]: ymirApi.reducer,
    [cedarApi.reducerPath]: cedarApi.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      api.middleware,
      cedarApi.middleware,
      authMiddleware,
    ]), // Add the middleware from RTK Query
});

store.subscribe(() => {
  const state = store.getState();
  saveState(state.qaDashboard);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
