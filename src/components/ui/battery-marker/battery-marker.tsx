import IconButton from "@mui/material/IconButton";
import {
	BatteryCharging,
	BatteryEmpty,
	BatteryFull,
	BatteryHigh,
	BatteryLow,
	BatteryMedium,
	Question,
} from "@phosphor-icons/react";
import { useBattery } from "@uidotdev/usehooks";
import { useEffect, useMemo, useRef, useState } from "react";
import AuroraSpinner from "../aurora-spinner/aurora-spinner";
import CoolTip from "../cool-tip/cool-tip";

type BatteryStatusLevel = "critical" | "low" | "medium" | "high" | "full";

type BatteryState = "charging" | "discharging" | "unknown";

interface BatteryInfo {
	supported: boolean;
	loading: boolean;
	level: number;
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
}

interface ComputedBatteryStatus {
	statusLevel: BatteryStatusLevel;
	state: BatteryState;
	label: string;
	color: string;
	percentage: number;
}

const BatteryMarker = () => {
	const batteryInfo = useBattery() as BatteryInfo;
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const computedStatus = useMemo(() => {
		return computeBatteryStatus(batteryInfo);
	}, [batteryInfo]);

	const [displayStatus, setDisplayStatus] = useState<ComputedBatteryStatus | null>(null);
	// const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

	useEffect(() => {
		if (!batteryInfo.loading && batteryInfo.supported) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}

			setDisplayStatus(computedStatus);
			// setLastUpdateTime(Date.now());

			timeoutRef.current = setTimeout(() => {
				// setLastUpdateTime(Date.now());
			}, 30000); // Refresh every 30 seconds
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [computedStatus, batteryInfo.loading, batteryInfo.supported]);

	const statusSummary = useMemo(() => {
		if (!batteryInfo.supported) {
			return {
				label: "Battery API not supported",
				status: "unknown" as BatteryState,
				level: "unknown" as BatteryStatusLevel,
				color: "var(--text-secondary)",
			};
		}

		if (batteryInfo.loading || !displayStatus) {
			return {
				label: "Loading battery status...",
				status: "unknown" as BatteryState,
				level: "unknown" as BatteryStatusLevel,
				color: "var(--text-secondary)",
			};
		}

		return {
			label: displayStatus.label,
			status: displayStatus.state,
			level: displayStatus.statusLevel,
			color: displayStatus.color,
		};
	}, [batteryInfo.supported, batteryInfo.loading, displayStatus]);

	const icon = useMemo(() => {
		const iconProps = {
			size: 18,
			color: statusSummary.color,
		};
		if (batteryInfo.loading) {
			return <AuroraSpinner size={15} />;
		}

		if (!batteryInfo.supported) {
			return <Question {...iconProps} />;
		}

		if (statusSummary.status === "charging") {
			return <BatteryCharging {...iconProps} />;
		}

		switch (statusSummary.level) {
			case "critical":
				return <BatteryEmpty {...iconProps} />;
			case "low":
				return <BatteryLow {...iconProps} />;
			case "medium":
				return <BatteryMedium {...iconProps} />;
			case "high":
				return <BatteryHigh {...iconProps} />;
			case "full":
				return <BatteryFull {...iconProps} />;
			default:
				return <Question {...iconProps} />;
		}
	}, [statusSummary, batteryInfo.loading, batteryInfo.supported]);
	if (!batteryInfo.supported) {
		return <></>;
	}
	return (
		<CoolTip title={statusSummary.label}>
			<IconButton size="small" sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "default" }}>
				{icon}
			</IconButton>
		</CoolTip>
	);
};

function computeBatteryStatus(batteryInfo: BatteryInfo): ComputedBatteryStatus {
	const { level, charging, chargingTime, dischargingTime } = batteryInfo;
	const percentage = Math.round(level * 100);

	let statusLevel: BatteryStatusLevel;
	if (level <= 0.15) {
		statusLevel = "critical";
	} else if (level <= 0.3) {
		statusLevel = "low";
	} else if (level <= 0.6) {
		statusLevel = "medium";
	} else if (level <= 0.9) {
		statusLevel = "high";
	} else {
		statusLevel = "full";
	}
	const state: BatteryState = charging ? "charging" : "discharging";

	let color: string;
	if (statusLevel === "critical") {
		color = "var(--error-main)";
	} else if (statusLevel === "low") {
		color = "var(--warning-main)";
	} else {
		color = "var(--success-main)";
	}

	let label: string;
	if (charging) {
		if (chargingTime && chargingTime !== Infinity) {
			const hours = Math.floor(chargingTime / 3600);
			const minutes = Math.floor((chargingTime % 3600) / 60);
			label = `Charging ${percentage}% (${hours}h ${minutes}m remaining)`;
		} else {
			label = `Charging ${percentage}%`;
		}
	} else {
		if (dischargingTime && dischargingTime !== Infinity) {
			const hours = Math.floor(dischargingTime / 3600);
			const minutes = Math.floor((dischargingTime % 3600) / 60);
			if (hours > 0) {
				label = `Battery ${percentage}% (${hours}h ${minutes}m remaining)`;
			} else {
				label = `Battery ${percentage}% (${minutes}m remaining)`;
			}
		} else {
			label = `Battery ${percentage}%`;
		}
	}

	return {
		statusLevel,
		state,
		label,
		color,
		percentage,
	};
}

export default BatteryMarker;
