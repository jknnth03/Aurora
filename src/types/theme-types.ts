import { CSSProperties } from "react";

// theme-types.ts

export type color = CSSProperties["color"];

export interface ColorVariant {
	main: color;
	light: color;
	dark: color;
	contrastText: color;
}

export interface ColorGroup {
	primary: ColorVariant;
	secondary: ColorVariant;
	error: ColorVariant;
	warning: ColorVariant;
	info: ColorVariant;
	success: ColorVariant;
	text: {
		main: color;
		light: color;
		dark: color;
		disabled: color;
	};
	background: {
		main: color;
		light: color;
		dark: color;
		paper: color;
	};
	// Add any other color groups here
}

export interface ThemeModeColors {
	[key: string]: color;
}

export interface ThemeVariant {
	light: ThemeModeColors;
	dark: ThemeModeColors;
}

// For MUI integration
export interface MUIThemeColors {
	primary: ColorVariant;
	secondary: ColorVariant;
	error: ColorVariant;
	warning: ColorVariant;
	info: ColorVariant;
	success: ColorVariant;
	text: {
		primary: color;
		secondary: color;
		disabled: color;
	};
	background: {
		default: color;
		paper: color;
	};
	// Add other MUI palette properties as needed
}

export interface PaletteColor {
	main: CSSProperties["color"];
	light?: CSSProperties["color"];
	dark?: CSSProperties["color"];
	contrastText?: CSSProperties["color"];
}

export interface Palette {
	primary: PaletteColor;
	secondary: PaletteColor;
	error: PaletteColor;
	warning: PaletteColor;
	info: PaletteColor;
	success: PaletteColor;
	background: PaletteColor;
	paper: PaletteColor;
	text: PaletteColor;
	tertiary?: PaletteColor;
	caution?: PaletteColor;
	highlight?: PaletteColor;
}

export interface ColorPalette {
	light: Palette;
	dark: Palette;
}

/**
 * Represents a set of color variations (e.g., main, light, dark).
 */
export type ColorSet = Record<string, string>;

/**
 * Represents a group of related colors (e.g., background, text, primary).
 */
export type ColorCategory = Record<string, ColorSet>;

/**
 * Represents the color palette for a specific mode (e.g., light, dark).
 */
export type ThemeMode = Record<string, ColorCategory>;

/**
 * Represents the complete set of theme colors, organized by theme name.
 */
export type IThemeColors = Record<string, ThemeMode>;

/**
 * Represents the input colors as a flat object.
 */
export type IInputColors = Record<string, string>;
