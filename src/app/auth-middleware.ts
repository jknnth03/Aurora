// src/app/auth-middleware.ts

import { Middleware } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { checkAuth } from "../features/slices/auth-slice";

export const authMiddleware: Middleware = (store) => (next) => (action) => {
	if (typeof action === "object" && action !== null && "type" in action && action.type === "@@INIT") {
		(store.dispatch as AppDispatch)(checkAuth());
	}

	return next(action);
};
