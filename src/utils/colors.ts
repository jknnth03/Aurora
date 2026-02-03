// UColor.ts
import { IThemeColors } from "../types/theme-types";

/**
 * Parses SCSS module exports into structured theme color objects
 * @param scssExports - The exported SCSS variables from a module
 * @returns Structured theme colors object
 */ export function parseThemeColors(inputColors: Record<string, string>): IThemeColors {
	const themeColors: IThemeColors = {};

	for (const key in inputColors) {
		if (Object.prototype.hasOwnProperty.call(inputColors, key)) {
			const parts = key.split("--");
			if (parts.length !== 4) {
				//console.error(`Invalid key format: ${key}. Expected format: Theme--Mode--Category--SubKey.`);
				continue;
			}

			const [themeName, mode, category, subKey] = parts;

			themeColors[themeName] ??= {};
			themeColors[themeName][mode] ??= {};
			themeColors[themeName][mode][category] ??= {};

			themeColors[themeName][mode][category][subKey] = inputColors[key].replace(/^"|"$/g, "");
		}
	}

	return themeColors;
}
