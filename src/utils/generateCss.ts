import * as fs from "fs";
import { debounce } from "lodash";
import * as path from "path";

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

const CONFIG: Config = {
  PATHS: {
    COLORS: path.resolve(__dirname, "../styles/colors"),
    OUTPUT: path.resolve(__dirname, "../styles/_autoColors.scss"),
  },
  DEBOUNCE_MS: 300,
  FILE_ENCODING: "utf8",
};

const fileCache: Map<string, FileCache> = new Map();

const formatScssName = (filename: string): string => {
  return path.basename(filename, ".scss").replace(/\s+/g, "_");
};

const generateImport = (filename: string): string => {
  const name = formatScssName(filename);
  return `@use "./colors/${filename}" as C${name};`;
};

const generateColorMapEntry = (filename: string): string => {
  const name = formatScssName(filename);
  return `  "${name}": C${name}.$color,`;
};

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
    }
    return true;
  }
};

const updateCache = async (
  filePath: string,
  content: string,
): Promise<void> => {
  try {
    const stats = await fs.promises.stat(filePath);
    fileCache.set(filePath, {
      content,
      mtime: stats.mtimeMs,
    });
  } catch (error) {
    if (error instanceof Error) {
    }
  }
};

const generateScssContent = (colorFiles: string[]): string => {
  const imports = colorFiles.map(generateImport).join("\n");
  const colorMap = `$colors: (\n${colorFiles
    .map(generateColorMapEntry)
    .join("\n")}\n);`;
  return `${imports}\n\n${colorMap}`;
};

async function generateSCSS(): Promise<void> {
  try {
    const files = await fs.promises.readdir(CONFIG.PATHS.COLORS);
    const colorFiles = files.filter((file) => file.endsWith(".scss"));

    if (colorFiles.length === 0) {
      return;
    }

    const filesChanged = await Promise.all(
      colorFiles.map((file) =>
        hasFileChanged(path.join(CONFIG.PATHS.COLORS, file)),
      ),
    ).then((results) => results.some((changed) => changed));

    if (!filesChanged) {
      return;
    }

    const outputScss = generateScssContent(colorFiles);

    const currentContent = await fs.promises
      .readFile(CONFIG.PATHS.OUTPUT, CONFIG.FILE_ENCODING)
      .catch(() => "");

    if (currentContent !== outputScss) {
      await fs.promises.writeFile(
        CONFIG.PATHS.OUTPUT,
        outputScss,
        CONFIG.FILE_ENCODING,
      );

      await Promise.all(
        colorFiles.map((file) =>
          updateCache(path.join(CONFIG.PATHS.COLORS, file), outputScss),
        ),
      );
    }
  } catch (error) {
    if (error instanceof Error) {
    }
  }
}

const debouncedGenerate = debounce(generateSCSS, CONFIG.DEBOUNCE_MS);

let watcher: fs.FSWatcher | null = null;

function setupWatcher(): void {
  try {
    watcher?.close();
    watcher = fs.watch(
      CONFIG.PATHS.COLORS,
      (eventType: WatchEventType, filename: string | null) => {
        if (filename?.endsWith(".scss")) {
          debouncedGenerate();
        }
      },
    );

    watcher.on("error", (error: Error) => {
      setTimeout(setupWatcher, 1000);
    });
  } catch (error) {
    if (error instanceof Error) {
    }
    setTimeout(setupWatcher, 1000);
  }
}

generateSCSS();

setupWatcher();

process.on("SIGINT", () => {
  watcher?.close();
  process.exit(0);
});
