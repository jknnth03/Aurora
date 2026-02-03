import { useState, useEffect } from "react";
import { MarkdownSource, useMarkdown } from "./useMarkdown";

interface UseMarkdownReaderProps {
	initialSource?: MarkdownSource;
}

interface UseMarkdownReaderReturn {
	markdown: string;
	loading: boolean;
	error: string | null;
	setMarkdownSource: (source: MarkdownSource) => void;
	loadFromUrl: (url: string) => void;
	loadFromText: (text: string) => void;
	loadFromImport: (importedMarkdown: string) => void;
}

/**
 * Higher level hook with convenient methods for setting markdown sources
 */
const useMarkdownReader = (props?: UseMarkdownReaderProps): UseMarkdownReaderReturn => {
	const [source, setSource] = useState<MarkdownSource | null>(props?.initialSource || null);
	const { markdown, loading, error, fetchMarkdown } = useMarkdown();

	// Helper functions to load markdown from different sources
	const setMarkdownSource = (newSource: MarkdownSource) => {
		setSource(newSource);
	};

	const loadFromUrl = (url: string) => {
		setSource({
			type: "url",
			content: url,
		});
	};

	const loadFromText = (text: string) => {
		setSource({
			type: "text",
			content: text,
		});
	};

	const loadFromImport = (importedMarkdown: string) => {
		setSource({
			type: "import",
			content: importedMarkdown,
		});
	};

	// Process markdown whenever source changes
	useEffect(() => {
		if (source) {
			fetchMarkdown(source);
		}
	}, [source]);

	return {
		markdown,
		loading,
		error,
		setMarkdownSource,
		loadFromUrl,
		loadFromText,
		loadFromImport,
	};
};

export default useMarkdownReader;
