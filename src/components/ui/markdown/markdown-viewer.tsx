// =============================================================================
// UPDATED MARKDOWN VIEWER (using shared config)
// File: src/components/markdown/MarkdownViewer.tsx
// =============================================================================

import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import { MarkdownSource, useMarkdown } from "../../../hooks/useMarkdown";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { createMarkdownComponents, createMarkdownContainerStyles, MARKDOWN_OPTIONS } from "./markdown-config";

export interface MarkdownViewerProps {
	src: MarkdownSource;
	className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ src, className }) => {
	const { markdown, loading, error, fetchMarkdown } = useMarkdown();
	const [content, setContent] = useState<string>("");
	const theme = useTheme();

	useEffect(() => {
		fetchMarkdown(src);
	}, [src]);

	useEffect(() => {
		setContent(markdown);
	}, [markdown]);

	// Use shared markdown components
	const markdownComponents = createMarkdownComponents(theme);

	if (loading) {
		return (
			<Box sx={{ p: 2 }}>
				<Skeleton variant="text" sx={{ mb: 1, height: 40 }} />
				<Skeleton variant="text" sx={{ mb: 2, height: 30 }} />
				<Skeleton variant="rectangular" sx={{ mb: 2, height: 100 }} />
				<Skeleton variant="text" sx={{ mb: 1 }} />
				<Skeleton variant="text" sx={{ mb: 1 }} />
				<Skeleton variant="text" sx={{ mb: 1 }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 2, color: "error.main", border: "1px solid", borderColor: "error.main", borderRadius: 1 }}>
				<Typography color="error">Error loading markdown: {error}</Typography>
			</Box>
		);
	}

	return (
		<Box sx={createMarkdownContainerStyles()} className={className}>
			<Markdown
				options={{
					overrides: markdownComponents,
					...MARKDOWN_OPTIONS,
				}}
			>
				{content}
			</Markdown>
		</Box>
	);
};
