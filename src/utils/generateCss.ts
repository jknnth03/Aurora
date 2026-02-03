import * as fs from "fs";
import { debounce } from "lodash";
import * as path from "path";

// Type definitions
interface FileCache {
	content: string;
	mtime: number;
}

interface Config {
	PATHS: {
		COLORS: string;
		OUTPUT: string;
	};
	DEBOUNCE_MS: number;
	FILE_ENCODING: "utf8";
}

type WatchEventType = "rename" | "change";

// Configuration
const CONFIG: Config = {
	PATHS: {
		COLORS: path.resolve(__dirname, "../styles/colors"),
		OUTPUT: path.resolve(__dirname, "../styles/_autoColors.scss"),
	},
	DEBOUNCE_MS: 300,
	FILE_ENCODING: "utf8",
};

// Cache for file contents and timestamps
const fileCache: Map<string, FileCache> = new Map();

/**
 * Formats a filename for SCSS use
 */
const formatScssName = (filename: string): string => {
	return path.basename(filename, ".scss").replace(/\s+/g, "_");
};

/**
 * Generates SCSS import statement
 */
const generateImport = (filename: string): string => {
	const name = formatScssName(filename);
	return `@use "./colors/${filename}" as C${name};`;
};

/**
 * Generates color map entry
 */
const generateColorMapEntry = (filename: string): string => {
	const name = formatScssName(filename);
	return `  "${name}": C${name}.$color,`;
};

/**
 * Checks if file has changed since last check
 */
const hasFileChanged = async (filePath: string): Promise<boolean> => {
	try {
		const stats = await fs.promises.stat(filePath);
		const cached = fileCache.get(filePath);

		if (!cached || cached.mtime !== stats.mtimeMs) {
			return true;
		}

		return false;
	} catch (error) {
		if (error instanceof Error) {
			//console.error(`Error checking file changes: ${error.message}`);
		}
		return true;
	}
};

/**
 * Updates file cache
 */
const updateCache = async (filePath: string, content: string): Promise<void> => {
	try {
		const stats = await fs.promises.stat(filePath);
		fileCache.set(filePath, {
			content,
			mtime: stats.mtimeMs,
		});
	} catch (error) {
		if (error instanceof Error) {
			//console.error(`Error updating cache: ${error.message}`);
		}
	}
};

/**
 * Generates SCSS content
 */
const generateScssContent = (colorFiles: string[]): string => {
	const imports = colorFiles.map(generateImport).join("\n");
	const colorMap = `$colors: (\n${colorFiles.map(generateColorMapEntry).join("\n")}\n);`;
	return `${imports}\n\n${colorMap}`;
};

/**
 * Main SCSS generation function
 */
async function generateSCSS(): Promise<void> {
	try {
		// Read directory
		const files = await fs.promises.readdir(CONFIG.PATHS.COLORS);
		const colorFiles = files.filter((file) => file.endsWith(".scss"));

		if (colorFiles.length === 0) {
			//console.warn("⚠️ No SCSS files found in the colors directory.");
			return;
		}

		// Check if any files have changed
		const filesChanged = await Promise.all(
			colorFiles.map((file) => hasFileChanged(path.join(CONFIG.PATHS.COLORS, file)))
		).then((results) => results.some((changed) => changed));

		if (!filesChanged) {
			return; // Skip generation if no changes
		}

		// Generate SCSS content
		const outputScss = generateScssContent(colorFiles);

		// Write only if content has changed
		const currentContent = await fs.promises.readFile(CONFIG.PATHS.OUTPUT, CONFIG.FILE_ENCODING).catch(() => "");

		if (currentContent !== outputScss) {
			await fs.promises.writeFile(CONFIG.PATHS.OUTPUT, outputScss, CONFIG.FILE_ENCODING);

			// Update cache for all files
			await Promise.all(colorFiles.map((file) => updateCache(path.join(CONFIG.PATHS.COLORS, file), outputScss)));

			//console.log(`✅ Generated colors map with ${colorFiles.length} colors`);
		}
	} catch (error) {
		if (error instanceof Error) {
			//console.error("❌ Error generating SCSS:", error.message);
		}
	}
}

// Debounced version of generateSCSS
const debouncedGenerate = debounce(generateSCSS, CONFIG.DEBOUNCE_MS);

// Set up file watching with error handling and automatic recovery
let watcher: fs.FSWatcher | null = null;

function setupWatcher(): void {
	try {
		watcher?.close();
		watcher = fs.watch(CONFIG.PATHS.COLORS, (eventType: WatchEventType, filename: string | null) => {
			if (filename?.endsWith(".scss")) {
				//console.log(`🔄 Detected change in ${filename}, regenerating...`);
				debouncedGenerate();
			}
		});

		watcher.on("error", (error: Error) => {
			//console.error("Watch error:", error.message);
			setTimeout(setupWatcher, 1000); // Retry setup after error
		});
	} catch (error) {
		if (error instanceof Error) {
			//console.error("Watch setup error:", error.message);
		}
		setTimeout(setupWatcher, 1000); // Retry setup after error
	}
}

// Initial generation
generateSCSS();

// Start watching
setupWatcher();

// Cleanup on process exit
process.on("SIGINT", () => {
	watcher?.close();
	process.exit(0);
});
