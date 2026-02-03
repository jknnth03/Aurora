// src/features/auth/AuthProvider.tsx

import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../app/store";
import AuroraSpinner from "../components/ui/aurora-spinner/aurora-spinner";
import { checkAuth, selectAuthLoading } from "../features/slices/auth-slice";
import Box from "@mui/material/Box";
import PageLoad from "../components/layout/__loading/__loading";

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const dispatch = useDispatch<AppDispatch>();
	const loading = useSelector(selectAuthLoading);
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		// Check authentication status when component mounts
		const checkAuthStatus = async () => {
			await dispatch(checkAuth());
			setAuthChecked(true);
		};

		checkAuthStatus();
	}, [dispatch]);

	// Show a loading state while checking authentication
	if (loading || !authChecked) {
		return <PageLoad />; // You can replace this with a proper loading component
	}

	return <>{children}</>;
};
