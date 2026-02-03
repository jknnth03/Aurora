// =============================================================================
// SHARED MARKDOWN CONFIGURATION
// File: src/components/markdown/markdownConfig.ts
// =============================================================================

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { alpha, Theme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

/**
 * Creates standardized markdown component overrides for markdown-to-jsx
 * Used by both MarkdownViewer and MarkdownEditor for consistency
 */
export const createMarkdownComponents = (theme: Theme) => ({
	h1: {
		component: Typography,
		props: {
			variant: "h4",
			gutterBottom: true,
			sx: {
				color: theme.palette.primary.main,
				fontSize: "1.75rem",
				fontWeight: 500,
				mt: 3,
				mb: 2,
			},
		},
	},
	h2: {
		component: Typography,
		props: {
			variant: "h5",
			gutterBottom: true,
			sx: {
				color: theme.palette.primary.main,
				fontSize: "1.5rem",
				fontWeight: 500,
				mt: 3,
				mb: 1.5,
			},
		},
	},
	h3: {
		component: Typography,
		props: {
			variant: "h6",
			gutterBottom: true,
			sx: {
				color: theme.palette.primary.light,
				fontSize: "1.25rem",
				fontWeight: 500,
				mt: 2.5,
				mb: 1.5,
			},
		},
	},
	h4: {
		component: Typography,
		props: {
			variant: "subtitle1",
			gutterBottom: true,
			sx: {
				color: theme.palette.primary.light,
				fontSize: "1.1rem",
				fontWeight: 500,
				mt: 2,
				mb: 1,
			},
		},
	},
	h5: {
		component: Typography,
		props: {
			variant: "subtitle2",
			gutterBottom: true,
			sx: {
				fontSize: "1rem",
				fontWeight: 500,
				mt: 2,
				mb: 1,
			},
		},
	},
	h6: {
		component: Typography,
		props: {
			variant: "subtitle2",
			gutterBottom: true,
			sx: {
				fontSize: "0.95rem",
				fontWeight: 500,
				mt: 1.5,
				mb: 0.75,
			},
		},
	},
	p: {
		component: Typography,
		props: {
			variant: "body2",
			paragraph: true,
			sx: {
				fontSize: "0.9rem",
				lineHeight: 1.6,
				my: 1,
			},
		},
	},
	a: {
		component: Link,
		props: {
			target: "_blank",
			rel: "noopener",
			sx: {
				color: theme.palette.secondary.main,
				fontSize: "inherit",
			},
		},
	},
	table: {
		component: Table,
		props: {
			size: "small",
			sx: { fontSize: "0.85rem" },
		},
	},
	thead: {
		component: TableHead,
		props: {
			sx: {
				"& .MuiTableCell-root": {
					color: theme.palette.text.primary,
				},
			},
		},
	},
	tbody: { component: TableBody },
	tr: { component: TableRow },
	th: {
		component: TableCell,
		props: {
			component: "th",
			sx: {
				fontWeight: "bold",
				fontSize: "0.85rem",
			},
		},
	},
	td: {
		component: TableCell,
		props: {
			sx: { fontSize: "0.85rem" },
		},
	},
	tableContainer: {
		component: TableContainer,
		props: {
			component: Paper,
			sx: { my: 2 },
		},
	},
	blockquote: {
		component: Box,
		props: {
			sx: {
				borderLeft: `4px solid ${theme.palette.divider}`,
				pl: 2,
				py: 0.5,
				my: 2,
				color: alpha(theme.palette.text.primary, 0.7),
				backgroundColor: alpha(theme.palette.background.paper, 0.3),
				fontSize: "0.9rem",
			},
		},
	},
	pre: {
		component: Box,
		props: {
			sx: {
				backgroundColor: alpha(theme.palette.background.paper, 0.5),
				p: 2,
				borderRadius: theme.shape.borderRadius,
				overflow: "auto",
				my: 2,
				fontFamily: '"Roboto Mono", monospace',
				fontSize: "0.85rem",
			},
		},
	},
	code: {
		component: Box,
		props: {
			component: "code",
			sx: {
				backgroundColor: alpha(theme.palette.background.paper, 0.5),
				p: 0.5,
				borderRadius: theme.shape.borderRadius / 2,
				fontFamily: '"Roboto Mono", monospace',
				fontSize: "0.85em",
			},
		},
	},
	img: {
		component: "img" as React.ElementType,
		props: {
			style: {
				maxWidth: "100%",
				height: "auto",
				borderRadius: theme.shape.borderRadius / 2,
				margin: "16px 0",
			},
		},
	},
	li: {
		component: Box,
		props: {
			component: "li",
			sx: {
				fontSize: "0.9rem",
				mb: 0.75,
				"& > p": {
					margin: 0,
				},
			},
		},
	},
	ul: {
		component: Box,
		props: {
			component: "ul",
			sx: {
				pl: 2.5,
				mb: 2,
				mt: 1,
			},
		},
	},
	ol: {
		component: Box,
		props: {
			component: "ol",
			sx: {
				pl: 2.5,
				mb: 2,
				mt: 1,
			},
		},
	},
	hr: {
		component: Box,
		props: {
			component: "hr",
			sx: {
				my: 3,
				border: "none",
				borderTop: `1px solid ${theme.palette.divider}`,
			},
		},
	},
});

/**
 * Shared markdown options for markdown-to-jsx
 */
export const MARKDOWN_OPTIONS = {
	forceBlock: false,
} as const;

/**
 * Shared container styles for markdown content
 */
export const createMarkdownContainerStyles = () => ({
	width: "100%",
	overflow: "auto",
	height: "100%",
});
