import { PaletteMode } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { CONFIG } from "../config/config";
import { selectColor, toggleMode } from "../features/slices/theme-slice";
import styles from "../STYLES/__palette.module.scss";
import { IThemeColors } from "../types/theme-types";
import { parseThemeColors } from "../utils/colors";
import { setCookie } from "../utils/cookie";
import { encrypt } from "../utils/crypto";

// Initialize these outside the component to avoid recreating on each render
const themeColors: IThemeColors = parseThemeColors(styles);

const root = document.documentElement;
const styleCache = new Map<string, string>();
export interface IColors {
	[category: string]: { [subKey: string]: string };
}
function usePaletteTheme(): {
	colors: IColors;
	mode: PaletteMode;
	colorList: IThemeColors;
	handleColorChange: (color: string) => void;
	handleModeChange: (mode?: string) => void;
	colorName: string;
} {
	const dispatch = useDispatch();
	const { mode, color } = useSelector((state: RootState) => state.themeSlice);
	const { enqueueSnackbar } = useSnackbar();

	const isInitialized = useRef(false);
	const currentThemeData = useMemo(() => {
		const themeData = themeColors?.[color]?.[mode];

		if (themeData && !isInitialized.current) {
			const batchUpdates: Array<[string, string]> = [];

			// First, set the full theme-specific variables
			for (const colorGroupName in themeData) {
				for (const variant in themeData[colorGroupName]) {
					const value = themeData[colorGroupName][variant];

					// Set the full theme-specific variable directly from the value in themeData
					// const fullCssVarName = `--${color}--${mode}--${colorGroupName}--${variant}`;
					// batchUpdates.push([fullCssVarName, value]);

					// Also set the shorthand variable for current theme
					const cssVarName = `--${colorGroupName}-${variant}`;
					batchUpdates.push([cssVarName, value]);

					// Cache the value for future reference
					const cacheKey = `${color}-${mode}-${colorGroupName}-${variant}`;
					styleCache.set(cacheKey, value);
				}
			}

			// Apply all updates in a batch to minimize reflows
			batchUpdates.forEach(([prop, value]) => {
				root.style.setProperty(prop, value);
			});

			isInitialized.current = true;
		}

		return themeData || {};
	}, [color, mode]);

	// const currentThemeData = useMemo(() => {
	// 	const themeData = themeColors?.[color]?.[mode];
	// 	if (themeData && !isInitialized.current) {
	// 		const batchUpdates: Array<[string, string]> = [];

	// 		for (const colorGroupName in themeData) {
	// 			for (const variant in themeData[colorGroupName]) {
	// 				const cssVarName = `--${colorGroupName}-${variant}`;
	// 				const fullCssVarName = `--${color}--${mode}--${colorGroupName}--${variant}`;
	// 				const cacheKey = `${color}-${mode}-${colorGroupName}-${variant}`;

	// 				let colorValue = styleCache.get(cacheKey);

	// 				if (!colorValue) {
	// 					colorValue = getComputedStyle(root).getPropertyValue(fullCssVarName).trim();
	// 					styleCache.set(cacheKey, colorValue);
	// 				}

	// 				batchUpdates.push([cssVarName, colorValue]);
	// 			}
	// 		}

	// 		batchUpdates.forEach(([prop, value]) => {
	// 			root.style.setProperty(prop, value);
	// 		});
	// 		isInitialized.current = true;
	// 	}

	// 	return themeData || {};
	// }, [color, mode]);

	const handleColorChange = useCallback(
		(newColor: string) => {
			if (color === newColor) return;
			const encryptedColor = encrypt(newColor);

			isInitialized.current = false;

			queueMicrotask(() => {
				const thisDate = new Date();
				setCookie(CONFIG.STORAGE.SYSTEM_COLOR.LABEL, encryptedColor, { expires: thisDate.getFullYear() });
				dispatch(selectColor(newColor));
				enqueueSnackbar(`Changed theme to ${newColor.replace(/_/g, " ")}`, { variant: "default" });
			});
		},
		[color, dispatch, enqueueSnackbar]
	);

	const handleModeChange = useCallback(
		(newMode?: string) => {
			if (newMode === mode) return;

			const invertedMode = mode === "light" ? "dark" : "light";
			const selectedMode = newMode || invertedMode;

			isInitialized.current = false;

			queueMicrotask(() => {
				const thisDate = new Date();
				setCookie(CONFIG.STORAGE.DARK_MODE.LABEL, selectedMode, { expires: thisDate.getFullYear() });
				dispatch(toggleMode(selectedMode as PaletteMode));
				enqueueSnackbar(`TOGGLED ${selectedMode.toUpperCase()} MODE`, { variant: "default" });
			});
		},
		[mode, dispatch, enqueueSnackbar]
	);

	return {
		colorName: color || "",
		colors: currentThemeData,
		mode,
		colorList: themeColors,
		handleColorChange,
		handleModeChange,
	};
}

export default usePaletteTheme;
