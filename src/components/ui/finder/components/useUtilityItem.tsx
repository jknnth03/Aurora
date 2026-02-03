import { useMemo, useRef } from "react";
import usePaletteTheme from "../../../../hooks/useTheme";
import BatteryMarker from "../../battery-marker/battery-marker";
import { BookmarkToggleButton } from "../../bookmarks/bookmarks";
import CurrentDate from "../../current-date-text/current-date";
import LightDarkModeSwitch from "../../light-dark-mode-switch/light-dark-mode-toggle";
import networkStatusMarker from "../../network-status-marker/network-status-marker";
import ProcessMarker from "../../process-marker/process-marker";
import ThemePickerButton from "../../theme-picker/theme-picker-button";
import { finderTitle, FinderMobile } from "../finder";
import { useFinderCaption } from "../useFinderCaption";
import { toolname, UtilityItem } from "./utility-item";
import { useOpenCreate } from "../../../../hooks/useOpenCreate";
import { CONFIG } from "../../../../config/config";

export const useUtilityItems = (): UtilityItem[] => {
  const modeSwitchRef = useRef<HTMLButtonElement>(null);
  const { open } = useOpenCreate("");
  const { colorList } = usePaletteTheme();
  const arrayOfColors = Object.keys(colorList)
    .map((c) => c.replace(/_/g, " "))
    .join(" ");

  const { currentCaption } = useFinderCaption({});
  const triggerModeSwitch = () => {
    if (modeSwitchRef.current) {
      modeSwitchRef.current.click();
    }
  };

  return useMemo((): UtilityItem[] => {
    const commonSearchStat = `larren kelly dela pena peña toodles tools utilities utility ${toolname} helper widget component control taskbar`;

    const items = [
      {
        key: "current-date",
        name: "Current Date & Time",
        description: <CurrentDate />,
        component: () => <CurrentDate dateFormat="MMM DD" />,
        searchableText: [
          commonSearchStat,
          "current date time clock now today timestamp",
          "calendar when what time hour minute second",
          "schedule timing moment present actual",
          "timezone utc local year month day",
          "datetime chronometer timekeeper watch",
        ].join(" "),
        listItemProps: {
          onClick: () => console.log("Current date clicked!"),
        },
      },
      {
        key: "process-status",
        name: "Process Status",
        description: "Displays if there is a process going on",
        component: () => <ProcessMarker />,
        searchableText: [
          commonSearchStat,
          "process status loading busy working progress",
          "running activity task operation executing",
          "spinner loader indicator marker signal",
          "active idle processing background foreground",
          "job queue pending completed finished",
        ].join(" "),
      },
      {
        key: "battery-status",
        name: "Battery Status",
        description: "Monitor device battery level and charging status",
        component: () => <BatteryMarker />,
        searchableText: [
          commonSearchStat,
          "battery power level charge charging discharging status",
          "energy juice fuel cell lithium ion electric",
          "percentage remaining full empty low critical high",
          "device laptop phone tablet mobile portable hardware",
          "time remaining duration estimate charging discharging",
          "power management consumption usage efficiency drain",
          "plug unplugged ac adapter charger cable wire",
          "indicator monitor tracker display widget meter gauge",
        ].join(" "),
      },
      {
        key: "theme-switch",
        name: "Theme Mode",
        description: "Switch between light and dark mode",
        component: () => (
          <LightDarkModeSwitch ref={modeSwitchRef} size="xxxs" />
        ),
        listItemProps: {
          onClick: () => {
            triggerModeSwitch();
          },
        },
        searchableText: [
          commonSearchStat,
          "theme mode dark light switch toggle appearance",
          "darkmode lightmode night day bright dim",
          "colors visual ui interface skin style",
          "contrast accessibility eyes strain black white",
          "preference setting display look feel design",
        ].join(" "),
      },
      {
        key: "network-status",
        name: "Network Status",
        description: "Show network connection status",
        component: networkStatusMarker,
        searchableText: [
          commonSearchStat,
          "network wifi internet connection status online offline",
          "connectivity signal data mobile cellular ethernet",
          "bandwidth speed latency ping connected disconnected",
          "web access browser http https api server",
          "wireless lan wan hotspot router modem",
        ].join(" "),
      },
      {
        key: "theme-picker",
        name: "Theme Picker",
        description: "Choose a Hue that defines You.",
        listItemProps: {
          onClick: () => {
            open(CONFIG.SUFFIX.theme_picker);
          },
        },
        component: () => <ThemePickerButton />,
        searchableText: [
          commonSearchStat,
          "theme",
          arrayOfColors.toLowerCase(),
        ].join(" "),
      },
      {
        key: "finder",
        name: finderTitle,
        description: currentCaption,
        component: () => <FinderMobile />,
        searchableText: [
          commonSearchStat,
          "search greg greggle finder peek navigate menu context",
          "lookup discover locate browse explore find",
          "query filter sort organize directory index",
          "module component tool utility function feature",
          "navigation path route link go goto jump",
        ].join(" "),
      },
      {
        key: "bookmarks",
        name: "Bookmarks",
        description: "Toggle bookmarks visibility",
        component: () => <BookmarkToggleButton onClick={() => {}} />,
        searchableText: [
          commonSearchStat,
          "bookmarks favorites saved pages heart star",
          "remember collection library shortcuts quicklinks",
          "toggle show hide visibility display view",
          "organize manage sort group category folder",
          "frequently used popular recent accessed pinned",
        ].join(" "),
      },
    ];
    return items;
  }, []);
};
