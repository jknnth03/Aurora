import { useEffect, useState } from "react";
import { TableOfContentsItem } from "../components/table-of-contents";

export const useHeaderMapping = (
	contentRef: React.RefObject<HTMLDivElement>,
	tocItems: Omit<TableOfContentsItem, "element">[],
	isContentReady: boolean
) => {
	const [mappedHeaders, setMappedHeaders] = useState<TableOfContentsItem[]>([]);

	useEffect(() => {
		if (!contentRef.current || !isContentReady || tocItems.length === 0) {
			return;
		}

		const mapHeaders = () => {
			const container = contentRef.current;
			if (!container) return;

			// Find all header elements in the rendered content
			const headerElements = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
			const mappedItems: TableOfContentsItem[] = [];

			tocItems.forEach((tocItem, index) => {
				// Try to find corresponding DOM element
				let matchedElement: HTMLElement | null = null;

				// First, try to find by exact text match
				for (const element of Array.from(headerElements)) {
					const elementText = element.textContent?.trim() || "";
					if (elementText === tocItem.text) {
						matchedElement = element as HTMLElement;
						break;
					}
				}

				// If no exact match, try fuzzy matching (in case of slight differences)
				if (!matchedElement && headerElements[index]) {
					matchedElement = headerElements[index] as HTMLElement;
				}

				if (matchedElement) {
					// Assign ID to the element
					matchedElement.id = tocItem.id;
					mappedItems.push({
						...tocItem,
						element: matchedElement,
					});
				}
			});

			setMappedHeaders(mappedItems);
		};

		// Use a timeout to ensure content is fully rendered
		const timeoutId = setTimeout(mapHeaders, 100);

		// Also use MutationObserver to catch any dynamic content changes
		const observer = new MutationObserver(mapHeaders);
		observer.observe(contentRef.current, {
			childList: true,
			subtree: true,
		});

		return () => {
			clearTimeout(timeoutId);
			observer.disconnect();
		};
	}, [tocItems, isContentReady]);

	return mappedHeaders;
};
