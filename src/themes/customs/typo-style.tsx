// components/theme/typographyStyles.ts

import { TypographyVariantsOptions } from "@mui/material/styles";

// Create typography settings that use your line-height variables
export const createTypographyStyles = (): TypographyVariantsOptions => ({
	fontFamily: ["Inter", "Poppins", "Nunito", "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(","),

	// Headers
	h1: {
		fontSize: "var(--fs-xxl)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-xxl)",
		letterSpacing: "var(--ls-xs)",
	},
	h2: {
		fontSize: "calc(var(--fs-xl) + 2px)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-xl)",
		letterSpacing: "var(--ls-xs)",
	},
	h3: {
		fontSize: "var(--fs-xl)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-xl)",
		letterSpacing: "var(--ls-xs)",
	},
	h4: {
		fontSize: "calc(var(--fs-lg) + 2px)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-lg)",
		letterSpacing: "var(--ls-xs)",
	},
	h5: {
		fontSize: "var(--fs-lg)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-lg)",
		letterSpacing: "var(--ls-xs)",
	},
	h6: {
		fontSize: "var(--fs-md)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-md)",
		letterSpacing: "var(--ls-xs)",
	},

	// Body text
	body1: {
		fontSize: "var(--fs-md)",
		lineHeight: "var(--lh-md)",
		letterSpacing: "var(--ls-xs)",
	},
	body2: {
		fontSize: "var(--fs-sm)",
		lineHeight: "var(--lh-sm)",
		letterSpacing: "var(--ls-xs)",
	},

	// Other typography variants
	subtitle1: {
		fontSize: "var(--fs-md)",
		fontWeight: "var(--fw-regular)",
		lineHeight: "var(--lh-md)",
		letterSpacing: "var(--ls-sm)",
	},
	subtitle2: {
		fontSize: "var(--fs-sm)",
		fontWeight: "var(--fw-regular)",
		lineHeight: "var(--lh-sm)",
		letterSpacing: "var(--ls-sm)",
	},
	button: {
		fontSize: "var(--fs-sm)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-sm)",
		letterSpacing: "var(--ls-sm)",
		textTransform: "none",
	},
	caption: {
		fontSize: "var(--fs-xs)",
		lineHeight: "var(--lh-xs)",
		letterSpacing: "var(--ls-xs)",
	},
	overline: {
		fontSize: "var(--fs-xs)",
		fontWeight: "var(--fw-bold)",
		lineHeight: "var(--lh-xs)",
		letterSpacing: "var(--ls-md)",
		textTransform: "uppercase",
	},
});
