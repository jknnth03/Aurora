// UCssVariables.ts
import { ThemeMode } from "../types/theme-types";

/**
 * Gets a CSS variable value from the document root
 * @param variableName CSS variable name (without --)
 * @param defaultValue Optional default value if variable is not found
 * @returns CSS variable value or default value
 */
export function getCssVariable(variableName: string, defaultValue: string = ""): string {
	const root = document.documentElement;
	const value = getComputedStyle(root).getPropertyValue(`--${variableName}`).trim();
	return value || defaultValue;
}

/**
 * Sets a CSS variable on the document root
 * @param variableName CSS variable name (without --)
 * @param value CSS variable value
 */
export function setCssVariable(variableName: string, value: string): void {
	const root = document.documentElement;
	root.style.setProperty(`--${variableName}`, value);
}

/**
 * Gets a fully qualified theme CSS variable name
 * @param themeName Theme name
 * @param mode Theme mode (light/dark)
 * @param colorGroup Color group name (primary, secondary, etc.)
 * @param variant Variant name (main, light, dark, etc.)
 * @returns Fully qualified CSS variable name (without --)
 */
export function getThemeVariableName(themeName: string, mode: ThemeMode, colorGroup: string, variant: string): string {
	return `${themeName}--${mode}--${colorGroup}--${variant}`;
}

/**
 * Gets a theme CSS variable value
 * @param themeName Theme name
 * @param mode Theme mode (light/dark)
 * @param colorGroup Color group name (primary, secondary, etc.)
 * @param variant Variant name (main, light, dark, etc.)
 * @param defaultValue Optional default value if variable is not found
 * @returns CSS variable value or default value
 */
export function getThemeVariable(
	themeName: string,
	mode: ThemeMode,
	colorGroup: string,
	variant: string,
	defaultValue: string = ""
): string {
	const variableName = getThemeVariableName(themeName, mode, colorGroup, variant);
	return getCssVariable(variableName, defaultValue);
}

/**
 * Sets a theme CSS variable value
 * @param themeName Theme name
 * @param mode Theme mode (light/dark)
 * @param colorGroup Color group name (primary, secondary, etc.)
 * @param variant Variant name (main, light, dark, etc.)
 * @param value CSS variable value
 */
export function setThemeVariable(
	themeName: string,
	mode: ThemeMode,
	colorGroup: string,
	variant: string,
	value: string
): void {
	const variableName = getThemeVariableName(themeName, mode, colorGroup, variant);
	setCssVariable(variableName, value);
}
