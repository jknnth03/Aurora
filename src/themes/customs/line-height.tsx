// components/theme/componentLineHeights.ts
import { Components, Theme } from "@mui/material/styles";

// Apply line-height variables to specific components beyond Typography
export const getComponentLineHeights = (theme: Theme): Components => ({
	// For buttons
	MuiButton: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-sm)",
			},
			// You can also target specific button sizes
			sizeSmall: {
				lineHeight: "var(--lh-xs)",
			},
			sizeLarge: {
				lineHeight: "var(--lh-md)",
			},
		},
	},

	// For list items
	MuiListItem: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-md)",
			},
		},
	},

	// For table cells
	MuiTableCell: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-md)",
			},
			head: {
				lineHeight: "var(--lh-sm)",
			},
		},
	},

	// For form inputs
	MuiInputBase: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-md)",
			},
			input: {
				lineHeight: "var(--lh-md)",
			},
		},
	},

	// For tabs
	MuiTab: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-sm)",
			},
		},
	},

	// For chips
	MuiChip: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-xs)",
			},
			label: {
				lineHeight: "var(--lh-xs)",
			},
		},
	},

	// For card content
	MuiCardContent: {
		styleOverrides: {
			root: {
				"&:last-child": {
					paddingBottom: "var(--s-2)",
				},
				"& > p:last-of-type": {
					marginBottom: 0,
				},
			},
		},
	},

	// For form labels
	MuiFormLabel: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-sm)",
			},
		},
	},

	// For form helper text
	MuiFormHelperText: {
		styleOverrides: {
			root: {
				lineHeight: "var(--lh-xs)",
				marginTop: "calc(var(--s-1) / 2)",
			},
		},
	},

	// For tooltips
	MuiTooltip: {
		styleOverrides: {
			tooltip: {
				lineHeight: "var(--lh-xs)",
			},
		},
	},

	// For snackbar messages
	MuiSnackbarContent: {
		styleOverrides: {
			message: {
				lineHeight: "var(--lh-sm)",
			},
		},
	},
});
