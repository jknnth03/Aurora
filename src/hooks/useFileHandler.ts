import { useState, useCallback } from "react";

interface FileHandlerState {
	loading: boolean;
	error: string | null;
	blob: Blob | null;
	url: string | null;
	content: string | null;
}

interface FileHandlerActions {
	downloadFile: (fileUrl: string, filename?: string) => Promise<void>;
	viewFile: (fileUrl: string) => Promise<string | null>;
	getBlobUrl: (fileUrl: string) => Promise<string | null>;
	getBlob: (fileUrl: string) => Promise<Blob | null>;
	reset: () => void;
}

type UseFileHandlerReturn = FileHandlerState & FileHandlerActions;

const useFileHandler = (): UseFileHandlerReturn => {
	const [state, setState] = useState<FileHandlerState>({
		loading: false,
		error: null,
		blob: null,
		url: null,
		content: null,
	});

	const fetchFile = useCallback(
		async (
			fileUrl: string,
			options?: { mode?: "cors" | "no-cors" | "same-origin"; useProxy?: boolean }
		): Promise<Blob> => {
			const { mode = "cors", useProxy = false } = options || {};

			// If using proxy, prepend a CORS proxy service
			const finalUrl = useProxy ? `https://corsproxy.io/?${encodeURIComponent(fileUrl)}` : fileUrl;

			const response = await fetch(finalUrl, {
				method: "GET",
				mode,
				headers: {
					Accept: "*/*",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
			}

			return response.blob();
		},
		[]
	);

	const fetchFileWithFallback = useCallback(
		async (fileUrl: string): Promise<Blob> => {
			try {
				// Try normal CORS request first
				return await fetchFile(fileUrl, { mode: "cors" });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);

				// Check if it's a CORS error
				if (errorMessage.includes("CORS") || errorMessage.includes("blocked")) {
					try {
						// Try with a CORS proxy
						console.warn("CORS blocked, attempting with proxy...");
						return await fetchFile(fileUrl, { useProxy: true });
					} catch (proxyError) {
						try {
							// Try no-cors mode as last resort (limited functionality)
							console.warn("Proxy failed, attempting no-cors mode...");
							return await fetchFile(fileUrl, { mode: "no-cors" });
						} catch (noCorsError) {
							throw new Error(
								`All fetch methods failed. Original CORS error: ${errorMessage}. Consider using a backend proxy or requesting CORS headers from the server.`
							);
						}
					}
				}

				// Re-throw if not a CORS error
				throw error;
			}
		},
		[fetchFile]
	);

	const downloadFile = useCallback(
		async (fileUrl: string, filename?: string) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const blob = await fetchFileWithFallback(fileUrl);
				const url = URL.createObjectURL(blob);

				// Create download link
				const link = document.createElement("a");
				link.href = url;
				link.download = filename || fileUrl.split("/").pop() || "downloaded-file";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up
				URL.revokeObjectURL(url);

				setState((prev) => ({
					...prev,
					loading: false,
					blob,
					url: null, // Don't store URL after download
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error instanceof Error ? error.message : "Download failed",
				}));
			}
		},
		[fetchFileWithFallback]
	);

	const viewFile = useCallback(
		async (fileUrl: string): Promise<string | null> => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const blob = await fetchFileWithFallback(fileUrl);
				const text = await blob.text();
				const url = URL.createObjectURL(blob);

				setState((prev) => ({
					...prev,
					loading: false,
					blob,
					url,
					content: text,
				}));

				return text;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error instanceof Error ? error.message : "Failed to view file",
				}));
				return null;
			}
		},
		[fetchFileWithFallback]
	);

	const getBlobUrl = useCallback(
		async (fileUrl: string): Promise<string | null> => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const blob = await fetchFileWithFallback(fileUrl);
				const url = URL.createObjectURL(blob);

				setState((prev) => ({
					...prev,
					loading: false,
					blob,
					url,
				}));

				return url;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error instanceof Error ? error.message : "Failed to create blob URL",
				}));
				return null;
			}
		},
		[fetchFileWithFallback]
	);

	const getBlob = useCallback(
		async (fileUrl: string): Promise<Blob | null> => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const blob = await fetchFileWithFallback(fileUrl);

				setState((prev) => ({
					...prev,
					loading: false,
					blob,
				}));

				return blob;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error instanceof Error ? error.message : "Failed to get blob",
				}));
				return null;
			}
		},
		[fetchFileWithFallback]
	);

	const reset = useCallback(() => {
		// Clean up any existing blob URL
		if (state.url) {
			URL.revokeObjectURL(state.url);
		}

		setState({
			loading: false,
			error: null,
			blob: null,
			url: null,
			content: null,
		});
	}, [state.url]);

	return {
		// State
		loading: state.loading,
		error: state.error,
		blob: state.blob,
		url: state.url,
		content: state.content,
		// Actions
		downloadFile,
		viewFile,
		getBlobUrl,
		getBlob,
		reset,
	};
};

export default useFileHandler;

// Example usage:
/*
import useFileHandler from './useFileHandler';

const FileComponent = () => {
  const {
    loading,
    error,
    blob,
    url,
    content,
    downloadFile,
    viewFile,
    getBlobUrl,
    getBlob,
    reset,
  } = useFileHandler();

  const fileUrl = 'https://pretest-aurora.rdfymir.com/backend/public/storage/patch-notes/Mt1UdVPfFCp5jtUmxvUTbfZ5viHcsleRicKotsvH.txt';

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      <button onClick={() => downloadFile(fileUrl, 'patch-notes.txt')}>
        Download File
      </button>
      
      <button onClick={() => viewFile(fileUrl)}>
        View Content
      </button>
      
      <button onClick={() => getBlobUrl(fileUrl)}>
        Get Blob URL for iframe
      </button>
      
      <button onClick={() => getBlob(fileUrl)}>
        Get Raw Blob
      </button>
      
      <button onClick={reset}>
        Reset
      </button>
      
      {content && (
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </pre>
      )}
      
      {url && (
        <iframe
          src={url}
          style={{ width: '100%', height: '400px' }}
          title="File Viewer"
        />
      )}
    </div>
  );
};

// Alternative: Create your own backend proxy endpoint
// app.get('/api/proxy', async (req, res) => {
//   const { url } = req.query;
//   const response = await fetch(url);
//   const data = await response.blob();
//   res.set('Access-Control-Allow-Origin', '*');
//   res.send(data);
// });
//
// Then use: await downloadFile('/api/proxy?url=' + encodeURIComponent(originalUrl));
*/
