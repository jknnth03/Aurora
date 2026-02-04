import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {
  WifiHigh,
  WifiLow,
  WifiMedium,
  WifiSlash,
  Desktop,
  CellSignalFull,
  CellSignalMedium,
  CellSignalLow,
  CellSignalX,
} from "@phosphor-icons/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CoolTip from "../cool-tip/cool-tip";

interface NetworkInformation extends EventTarget {
  readonly effectiveType: "2g" | "3g" | "4g" | "slow-2g";
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type:
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "none"
    | "wifi"
    | "wimax"
    | "other"
    | "unknown";
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

type ConnectionQuality = "fast" | "medium" | "slow" | "unknown";

type ConnectionType = "wifi" | "cellular" | "ethernet" | "other";

interface NetworkStatusState {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  connectionType: ConnectionType;
}

interface StatusSummary {
  label: string;
  status: "offline" | "slow" | "medium" | "fast" | "online";
  type: ConnectionType;
}

const NetworkStatusIndicator: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusState>({
    isOnline: navigator.onLine,
    connectionQuality: "unknown",
    connectionType: "other",
  });

  const getConnectionType = useCallback((): ConnectionType => {
    const nav = navigator as NavigatorWithConnection;

    if (nav.connection) {
      const connectionType = nav.connection.type;

      if (connectionType === "wifi") return "wifi";
      if (connectionType === "cellular") return "cellular";
      if (connectionType === "ethernet") return "ethernet";
    }

    return "other";
  }, []);

  const getConnectionQuality = useCallback((): ConnectionQuality => {
    const nav = navigator as NavigatorWithConnection;

    if (nav.connection) {
      const connection = nav.connection;
      if (connection.effectiveType === "4g") return "fast";
      if (connection.effectiveType === "3g") return "medium";
      if (["2g", "slow-2g"].includes(connection.effectiveType)) return "slow";
    }
    return "unknown";
  }, []);

  const updateNetworkStatus = useCallback((): void => {
    setNetworkStatus({
      isOnline: navigator.onLine,
      connectionQuality: getConnectionQuality(),
      connectionType: getConnectionType(),
    });
  }, [getConnectionQuality, getConnectionType]);

  useEffect(() => {
    updateNetworkStatus();

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      nav.connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      if (nav.connection) {
        nav.connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  const summary = useMemo((): StatusSummary => {
    const { isOnline, connectionQuality, connectionType } = networkStatus;

    if (!isOnline)
      return {
        label: "You're currently offline",
        status: "offline",
        type: connectionType,
      };

    if (connectionQuality === "slow")
      return {
        label: `${connectionType.toUpperCase()} - ${connectionQuality.toUpperCase()}`,
        status: "slow",
        type: connectionType,
      };

    if (connectionQuality === "medium")
      return {
        label: `${connectionType.toUpperCase()} - ${connectionQuality.toUpperCase()}`,
        status: "medium",
        type: connectionType,
      };

    if (connectionQuality === "fast")
      return {
        label: `${connectionType.toUpperCase()} - ${connectionQuality.toUpperCase()}`,
        status: "fast",
        type: connectionType,
      };

    return {
      label: `${connectionType.toUpperCase()} - Online`,
      status: "online",
      type: connectionType,
    };
  }, [networkStatus]);

  const icon = useMemo((): React.ReactNode => {
    if (summary.status === "offline") {
      return <WifiSlash color="var(--error-main)" size={16} />;
    }

    switch (summary.type) {
      case "cellular":
        switch (summary.status) {
          case "slow":
            return <CellSignalLow color="var(--warning-main)" size={16} />;
          case "medium":
            return <CellSignalMedium color="var(--info-main)" size={16} />;
          case "fast":
          case "online":
            return <CellSignalFull color="var(--success-main)" size={16} />;
          default:
            return <CellSignalX color="var(--error-main)" size={16} />;
        }

      case "ethernet":
        return (
          <Desktop
            color={
              summary.status === "slow"
                ? "var(--warning-main)"
                : summary.status === "medium"
                ? "var(--info-main)"
                : "var(--success-main)"
            }
            size={16}
          />
        );

      case "wifi":
      default:
        switch (summary.status) {
          case "slow":
            return <WifiLow color="var(--warning-main)" size={16} />;
          case "medium":
            return <WifiMedium color="var(--info-main)" size={16} />;
          case "fast":
          case "online":
            return <WifiHigh color="var(--success-main)" size={16} />;
          default:
            return <WifiSlash color="var(--error-main)" size={16} />;
        }
    }
  }, [summary.status, summary.type]);

  return (
    <Box>
      <CoolTip title={`Network Status: ${summary.label}`}>
        <IconButton
          size="small"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "default",
          }}>
          {icon}
        </IconButton>
      </CoolTip>
    </Box>
  );
};

export default React.memo(NetworkStatusIndicator);
