// File: components/shared/last-visit-display/useLastVisit.ts

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import moment from "moment";
import { getCookie, setCookie } from "../../../utils/cookie";

type UseLastVisitReturn = {
	lastVisit: string;
	triggerUpdate: () => void;
	createVisit: () => void;
};

export type { UseLastVisitReturn };

export const useLastVisit = (path: string): UseLastVisitReturn => {
	const [lastVisitUpdate, setLastVisitUpdate] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Memoize last visit calculation that responds to updates
	const lastVisit = useMemo(() => {
		const cookieValue = getCookie("last-visit" + path);
		if (!cookieValue) return "";

		// Try to parse as ISO format first (new format)
		let parsedDate = moment(cookieValue, moment.ISO_8601, true);

		// If invalid, try parsing as native Date string (old format)
		if (!parsedDate.isValid()) {
			parsedDate = moment(new Date(cookieValue));
		}

		return parsedDate.isValid() ? parsedDate.fromNow() : "";
	}, [path, lastVisitUpdate]);

	// Set up real-time updates
	useEffect(() => {
		const cookieValue = getCookie("last-visit" + path);

		if (cookieValue) {
			// Update every 30 seconds
			intervalRef.current = setInterval(() => {
				setLastVisitUpdate(moment().valueOf());
			}, 30000);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [path]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Manual trigger function
	const triggerUpdate = useCallback(() => {
		setLastVisitUpdate(moment().valueOf());
	}, []);

	// Function to create a new visit
	const createVisit = useCallback(() => {
		setCookie("last-visit" + path, moment().toISOString());
		// Trigger immediate update to reflect the change
		setLastVisitUpdate(moment().valueOf());
	}, [path]);

	return {
		lastVisit,
		triggerUpdate,
		createVisit,
	};
};
