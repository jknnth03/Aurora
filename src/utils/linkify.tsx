import React from "react";
import { getCssVariable } from "./cssVariables";
import ClickAwayListener from "@mui/material/ClickAwayListener";

// Define a more robust helper function with proper types

/** FYI THIS IS THE PATTERN OF THE LINK
 * [[LINK|/password-security|Click here]]
 *
 */

export const linkify = (text: string): React.ReactNode => {
	if (!text) return text;

	// Pattern using a different delimiter: [[LINK|url|text]]
	const pattern = /\[\[LINK\|(.*?)\|(.*?)\]\]/g;

	if (!text.match(pattern)) return text;

	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let isQueryParams = false;

	while ((match = pattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push(text.substring(lastIndex, match.index));
		}

		const [, url, linkText] = match;

		// 👉 Detect if the URL starts with or includes a `?`
		if (url.startsWith("?")) {
			isQueryParams = true;
		} else if (url.includes("?")) {
			//console.log("URL includes a ? somewhere:", url);
		}

		parts.push(
			<ClickAwayListener
				key={match.index}
				onClickAway={() => {
					// Get the current URL
					// Clear all query parameters
					// Option 1: Remove specific parameters that you know you added
					// For example: currentUrl.searchParams.delete('TEXT');

					// Option 2: Remove all query parameters and keep the base URL
					window.history.pushState({}, "", window.location.pathname);
				}}
			>
				<a
					key={match.index}
					href={url}
					style={{
						color: getCssVariable("info-dark", "text-main"),
						fontWeight: "bold",
						textDecoration: "underline",
					}}
					onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
						e.preventDefault(); // Prevent default navigation
						e.stopPropagation();

						if (isQueryParams) {
							// Update URL without page reload using History API
							const newUrl = new URL(window.location.href);
							const targetUrl = new URL(url, window.location.origin);

							// Get the query parameters from the target URL
							const searchParams = targetUrl.searchParams;

							// Add each query parameter to the current URL
							for (const [key, value] of searchParams.entries()) {
								newUrl.searchParams.set(key, value);
							}

							// Update the URL without reloading the page
							window.history.pushState({}, "", newUrl.toString());
						} else {
							// Open in a new tab if not a query parameter URL
							window.open(url, "_blank", "noopener,noreferrer");
						}
					}}
				>
					{linkText}
				</a>
			</ClickAwayListener>
		);

		lastIndex = match.index + match[0].length;
	}

	// Add any remaining text without extra spaces
	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex));
	}

	// Return without adding any wrapper that might create spaces
	return <>{parts}</>;
};
