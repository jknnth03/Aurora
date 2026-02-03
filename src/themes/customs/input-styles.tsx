// components/theme/inputStyles.ts
import { Components, Theme } from "@mui/material/styles";

export const inputStyles = (theme: Theme): Components["MuiTextField"] => ({
	styleOverrides: {
		root: {
			// Apply consistent spacing based on your spacing variables
			"& .MuiOutlinedInput-root": {
				borderRadius: theme.shape.borderRadius, // Using your spacing variable for border radius
				// You can adjust these values based on your needs
				padding: `calc(var(--s-1) / 2) var(--s-1)`,
			},
			"& .MuiInputLabel-root": {
				marginBottom: theme.shape.borderRadius,
				fontSize: theme.typography.fontSize,
				lineHeight: "var(--lh-sm)",
			},
			"& .MuiInputBase-input": {
				// Adjust input padding
				padding: theme.shape.borderRadius,
				fontSize: "var(--fs-md)",
				lineHeight: "var(--lh-md)",
				letterSpacing: "var(--ls-xs)",
			},
			// Add spacing between form elements when stacked
			marginBottom: "var(--s-2)",
		},
	},
});

// For the MuiOutlinedInput component specifically
export const outlinedInputStyles = (theme: Theme): Components["MuiOutlinedInput"] => ({
	styleOverrides: {
		root: {
			borderRadius: theme.shape.borderRadius, // Using your spacing variable

			// Adjust padding inside the input
			"& .MuiOutlinedInput-input": {
				padding: "var(--s-1) var(--s-2)",
			},

			// Style the border when not focused
			"& .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
				borderWidth: "1px",
				transition: "border-color 0.2s",
			},

			// Hover state
			"&:hover .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
			},

			// Focused state
			"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.primary.main,
				borderWidth: "1px", // Keep border width consistent for a cleaner look
			},

			// Error state
			"&.Mui-error .MuiOutlinedInput-notchedOutline": {
				borderColor: theme.palette.error.main,
			},
		},
		// Style for the input field itself
		input: {
			fontWeight: "var(--fw-regular)",
		},
	},
});

// For the Input Label (the floating label)
export const inputLabelStyles = (theme: Theme): Components["MuiInputLabel"] => ({
	styleOverrides: {
		root: {
			fontSize: theme.typography.fontSize,
			transform: "translate(var(--s-2), var(--s-2)) scale(1)",
			"&.Mui-focused, &.MuiFormLabel-filled": {
				transform: `translate(var(--s-2), calc(var(--s-1) / 2)) scale(0.75)`,
			},
		},
	},
});

// For the FormHelperText (error messages and hints)
export const formHelperTextStyles = (theme: Theme): Components["MuiFormHelperText"] => ({
	styleOverrides: {
		root: {
			marginLeft: "var(--s-2)",
			marginTop: "calc(var(--s-1) / 2)",
			fontSize: "var(--fs-xs)",
		},
	},
});
