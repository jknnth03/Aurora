import { useEffect, useState } from "react";

interface UseFileFetcherResult {
	content: string;
	loading: boolean;
	error: string | null;
}

const urlToUse = import.meta.env.VITE_AURORA_FILES; // CHANGE THIS TO VITE_AURORA_FILES (FOR BUILD) | VITE_PROXY_FILE_URL (FOR LOCAL)

export const useFetchFile = (filepath: string, filename: string): UseFileFetcherResult => {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!filepath || !filename) {
			setLoading(false);
			setError("No Content");
			return;
		} else {
			const fetchContent = async () => {
				setLoading(true);
				setError(null);

				try {
					const filePath = filepath.split("/").pop();
					// 👇 proxy path (use your vite config)
					const url = `${urlToUse}/${filePath}`;
					const response = await fetch(url);

					if (!response.ok) throw new Error(`HTTP ${response.status}`);

					let data: string;
					if (filename.endsWith(".txt") || filename.endsWith(".md")) {
						data = await response.text();
					} else {
						const blob = await response.blob();
						data = URL.createObjectURL(blob); // PDF, images, etc.
					}

					setContent(data);
				} catch (err: any) {
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};

			fetchContent();
		}
	}, [filepath, filename]);

	return { content, loading, error };
};
