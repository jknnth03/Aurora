import { useState, useEffect } from "react";

// Types for markdown source
export type MarkdownSource = {
	type: "text" | "url" | "file" | "import";
	content: string;
};

/**
 * A hook to fetch markdown content from various sources
 */
export const useMarkdown = () => {
	const [markdown, setMarkdown] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchMarkdown = async (source: MarkdownSource) => {
		setLoading(true);
		setError(null);

		try {
			let content = "";

			switch (source.type) {
				case "text":
					content = source.content;
					break;

				case "url": {
					const response = await fetch(source.content);
					if (!response.ok) {
						throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
					}
					content = await response.text();
					break;
				}

				case "file":
					// For file uploads through input elements
					content = source.content;
					break;

				case "import":
					// For directly imported markdown files using vite-plugin-markdown
					content = source.content;
					break;

				default:
					throw new Error("Invalid source type");
			}

			setMarkdown(content);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unknown error occurred");
			setMarkdown("");
		} finally {
			setLoading(false);
		}
	};

	return {
		markdown,
		loading,
		error,
		fetchMarkdown,
		setMarkdown,
	};
};

/**
 * Helper function to read a file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = (e) => reject(new Error("Failed to read file"));
		reader.readAsText(file);
	});
};
