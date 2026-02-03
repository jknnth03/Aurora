import { useEffect, useState, useMemo, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import { Bomb, Coffee, Confetti } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { ongoingMutation, ongoingQuery } from "../../../features/slices/auth-slice";
import AuroraSpinner from "../aurora-spinner/aurora-spinner";
import CoolTip from "../cool-tip/cool-tip";

// Define status types for strict type checking
type RequestStatus = "idle" | "pending" | "fulfilled" | "rejected";

// Define generic interface for request items
interface RequestState<T = unknown> {
	status: RequestStatus;
	data?: T;
	error?: Error;
}

// Define the shape of the request state maps
interface RequestStateMap<TData = unknown> {
	[key: string]: RequestState<TData>;
}

// Interface for computed status information
interface ComputedStatus {
	currentStatus: RequestStatus;
	label: string;
	hasPendingQuery: boolean;
	hasPendingMutation: boolean;
}

const ProcessMarker = () => {
	const mutation = useSelector(ongoingMutation) as RequestStateMap;
	const query = useSelector(ongoingQuery) as RequestStateMap;
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Memoize the status calculation to avoid recalculating on every render
	const computedStatus = useMemo(() => {
		return computeStatus(query, mutation);
	}, [query, mutation]);

	const [displayStatus, setDisplayStatus] = useState<RequestStatus>("idle");
	const [pendingTypes, setPendingTypes] = useState({ query: false, mutation: false });

	// Single effect to handle status updates and timeout management
	useEffect(() => {
		const { currentStatus, hasPendingQuery, hasPendingMutation } = computedStatus;

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = undefined;
		}

		// Update display status and pending types
		if (currentStatus !== "idle") {
			setDisplayStatus(currentStatus);
			setPendingTypes({ query: hasPendingQuery, mutation: hasPendingMutation });

			// Set timeout to return to idle only for non-pending statuses
			if (currentStatus !== "pending") {
				timeoutRef.current = setTimeout(() => {
					setDisplayStatus("idle");
				}, 8000);
			}
		}

		// Cleanup timeout on unmount
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [computedStatus]);

	// Memoize the final status summary to avoid recalculation
	const statusSummary = useMemo(() => {
		return getStatusSummary(displayStatus, pendingTypes);
	}, [displayStatus, pendingTypes]);

	// Memoize the icon to avoid recreating on every render
	const icon = useMemo(() => {
		switch (statusSummary.status) {
			case "pending":
				return <AuroraSpinner size={15} />;
			case "rejected":
				return <Bomb color="var(--error-main)" />;
			case "fulfilled":
				return <Confetti color="var(--success-main)" />;
			case "idle":
			default:
				return <Coffee color="var(--warning-main)" />;
		}
	}, [statusSummary.status]);

	return (
		<CoolTip title={statusSummary.label}>
			<IconButton size="small" sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "default" }}>
				{icon}
			</IconButton>
		</CoolTip>
	);
};

// Optimized status computation function
function computeStatus<TData = unknown>(
	query: RequestStateMap<TData>,
	mutation: RequestStateMap<TData>
): ComputedStatus {
	const states = [...Object.values(query), ...Object.values(mutation)];

	if (states.length === 0) {
		return {
			currentStatus: "idle",
			label: "Nothing going on",
			hasPendingQuery: false,
			hasPendingMutation: false,
		};
	}

	// Single pass through all states
	const statusCounts = states.reduce(
		(acc, state) => {
			acc[state.status]++;
			return acc;
		},
		{ idle: 0, pending: 0, fulfilled: 0, rejected: 0 }
	);

	// Check for pending states in each category
	const hasPendingQuery = Object.values(query).some((state) => state.status === "pending");
	const hasPendingMutation = Object.values(mutation).some((state) => state.status === "pending");

	// Determine current status with priority: pending > error > success > idle
	let currentStatus: RequestStatus;
	if (statusCounts.pending > 0) {
		currentStatus = "pending";
	} else if (statusCounts.rejected === states.length) {
		// Only show error if ALL states are error
		currentStatus = "rejected";
	} else if (statusCounts.fulfilled > 0) {
		currentStatus = "fulfilled";
	} else {
		currentStatus = "idle";
	}

	// Generate label based on status
	let label: string;
	switch (currentStatus) {
		case "pending":
			if (hasPendingQuery && hasPendingMutation) {
				label = "Processing data...";
			} else if (hasPendingQuery) {
				label = "Getting data...";
			} else if (hasPendingMutation) {
				label = "Processing your payload...";
			} else {
				label = "Processing...";
			}
			break;
		case "rejected":
			label = "Something went wrong";
			break;
		case "fulfilled":
			label = "Success";
			break;
		default:
			label = "Nothing going on";
	}

	return {
		currentStatus,
		label,
		hasPendingQuery,
		hasPendingMutation,
	};
}

// Helper function to get status summary (separated for clarity)
function getStatusSummary(
	displayStatus: RequestStatus,
	pendingTypes: { query: boolean; mutation: boolean }
): { label: string; status: RequestStatus } {
	switch (displayStatus) {
		case "pending":
			if (pendingTypes.query && pendingTypes.mutation) {
				return { label: "Processing data...", status: "pending" };
			} else if (pendingTypes.query) {
				return { label: "Getting data...", status: "pending" };
			} else if (pendingTypes.mutation) {
				return { label: "Processing your payload...", status: "pending" };
			}
			return { label: "Processing...", status: "pending" };
		case "rejected":
			return { label: "Something went wrong", status: "rejected" };
		case "fulfilled":
			return { label: "Success", status: "fulfilled" };
		default:
			return { label: "Nothing going on", status: "idle" };
	}
}

export default ProcessMarker;
