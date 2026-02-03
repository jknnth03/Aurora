// Helper function to extract headers from markdown content (for TOC generation only)

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { SquareHalfBottom } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

export interface TableOfContentsItem {
	id: string;
	text: string;
	level: number;
	element?: HTMLElement;
}

export const extractTableOfContents = (markdownContent: string): Omit<TableOfContentsItem, "element">[] => {
	if (!markdownContent) return [];

	const headerRegex = /^(#{1,6})\s+(.+)$/gm;
	const headers: Omit<TableOfContentsItem, "element">[] = [];
	let match;

	while ((match = headerRegex.exec(markdownContent)) !== null) {
		const level = match[1].length;
		const originalText = match[2].trim();

		// Clean text for ID generation - remove emojis, icons, and special characters
		const cleanText = originalText
			.replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Remove emojis
			.replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Replace multiple hyphens with single
			.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

		// Generate unique ID
		const id = cleanText || `header-${headers.length + 1}`;
		const existingIds = headers.map((h) => h.id);
		let counter = 1;
		let uniqueId = id;

		while (existingIds.includes(uniqueId)) {
			uniqueId = `${id}-${counter}`;
			counter++;
		}

		headers.push({
			id: uniqueId,
			text: originalText,
			level,
		});
	}

	return headers;
};
// Sidebar Table of Contents Component
const TableOfContentsSidebar: React.FC<{
	headers: TableOfContentsItem[];
	isOpen: boolean;
	onToggle: () => void;
	isMobile: boolean;
}> = ({ headers, isOpen, onToggle, isMobile }) => {
	const [activeHeader, setActiveHeader] = useState<string>("");

	// Scroll to header function
	const scrollToHeader = useCallback((header: TableOfContentsItem) => {
		if (header.element) {
			// Use the actual DOM element for reliable scrolling
			header.element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
			setActiveHeader(header.id);
		} else {
			// Fallback to getElementById
			const element = document.getElementById(header.id);
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
				setActiveHeader(header.id);
			}
		}
	}, []);

	// Track active header on scroll
	useEffect(() => {
		if (headers.length === 0) return;

		const handleScroll = () => {
			const scrollPosition = window.scrollY + 150; // Offset for better UX

			let currentActive = "";
			for (let i = headers.length - 1; i >= 0; i--) {
				const header = headers[i];
				if (header.element) {
					const elementTop = header.element.offsetTop;
					if (elementTop <= scrollPosition) {
						currentActive = header.id;
						break;
					}
				}
			}

			if (currentActive !== activeHeader) {
				setActiveHeader(currentActive);
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Run once to set initial active header

		return () => window.removeEventListener("scroll", handleScroll);
	}, [headers, activeHeader]);

	if (headers.length === 0) return null;

	const sidebarContent = (
		<Box>
			<List dense sx={{ py: 0 }}>
				{headers.map((header) => (
					<ListItem key={header.id} disablePadding>
						<ListItemButton
							onClick={() => scrollToHeader(header)}
							selected={activeHeader === header.id}
							sx={{
								pl: 1 + (header.level - 1) * 1.5,
								py: 0.5,
								minHeight: "auto",
								"&.Mui-selected": {
									backgroundColor: "primary.main",
									color: "white",
									"&:hover": {
										backgroundColor: "primary.dark",
									},
								},
								"&:hover": {
									backgroundColor: "action.hover",
								},
							}}
						>
							<ListItemText
								primary={header.text}
								slotProps={{
									primary: {
										variant: header.level <= 2 ? "body2" : "caption",
										fontWeight: header.level <= 2 ? 600 : 400,
										color: header.level <= 2 ? "primary" : undefined,
										sx: {
											ml: 0.5,
											fontSize: isMobile ? "0.75rem" : undefined,
											lineHeight: 1.2,
										},
									},
								}}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Box>
	);

	if (isMobile) {
		return (
			<Box sx={{ position: "relative", mb: 2 }}>
				<IconButton onClick={onToggle}>
					<SquareHalfBottom />
				</IconButton>
				<Collapse in={isOpen}>
					<Box sx={{ maxHeight: "fit-content" }}>{sidebarContent}</Box>
				</Collapse>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				width: 280,
				flexShrink: 0,
				height: "fit-content",
				maxHeight: "70vh",
				position: "sticky",
				top: 20,
			}}
		>
			{sidebarContent}
		</Box>
	);
};

export default TableOfContentsSidebar;
