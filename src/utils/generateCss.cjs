"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var lodash_1 = require("lodash");
var path = require("path");
// Configuration
var CONFIG = {
    PATHS: {
        COLORS: path.resolve(__dirname, "../styles/colors"),
        OUTPUT: path.resolve(__dirname, "../styles/_autoColors.scss"),
    },
    DEBOUNCE_MS: 300,
    FILE_ENCODING: "utf8",
};
// Cache for file contents and timestamps
var fileCache = new Map();
/**
 * Formats a filename for SCSS use
 */
var formatScssName = function (filename) {
    return path.basename(filename, ".scss").replace(/\s+/g, "_");
};
/**
 * Generates SCSS import statement
 */
var generateImport = function (filename) {
    var name = formatScssName(filename);
    return "@use \"./colors/".concat(filename, "\" as C").concat(name, ";");
};
/**
 * Generates color map entry
 */
var generateColorMapEntry = function (filename) {
    var name = formatScssName(filename);
    return "  \"".concat(name, "\": C").concat(name, ".$color,");
};
/**
 * Checks if file has changed since last check
 */
var hasFileChanged = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, cached, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs.promises.stat(filePath)];
            case 1:
                stats = _a.sent();
                cached = fileCache.get(filePath);
                if (!cached || cached.mtime !== stats.mtimeMs) {
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof Error) {
                    //console.error(`Error checking file changes: ${error.message}`);
                }
                return [2 /*return*/, true];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Updates file cache
 */
var updateCache = function (filePath, content) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs.promises.stat(filePath)];
            case 1:
                stats = _a.sent();
                fileCache.set(filePath, {
                    content: content,
                    mtime: stats.mtimeMs,
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                if (error_2 instanceof Error) {
                    //console.error(`Error updating cache: ${error.message}`);
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Generates SCSS content
 */
var generateScssContent = function (colorFiles) {
    var imports = colorFiles.map(generateImport).join("\n");
    var colorMap = "$colors: (\n".concat(colorFiles.map(generateColorMapEntry).join("\n"), "\n);");
    return "".concat(imports, "\n\n").concat(colorMap);
};
/**
 * Main SCSS generation function
 */
function generateSCSS() {
    return __awaiter(this, void 0, void 0, function () {
        var files, colorFiles, filesChanged, outputScss_1, currentContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, fs.promises.readdir(CONFIG.PATHS.COLORS)];
                case 1:
                    files = _a.sent();
                    colorFiles = files.filter(function (file) { return file.endsWith(".scss"); });
                    if (colorFiles.length === 0) {
                        //console.warn("⚠️ No SCSS files found in the colors directory.");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all(colorFiles.map(function (file) { return hasFileChanged(path.join(CONFIG.PATHS.COLORS, file)); })).then(function (results) { return results.some(function (changed) { return changed; }); })];
                case 2:
                    filesChanged = _a.sent();
                    if (!filesChanged) {
                        return [2 /*return*/]; // Skip generation if no changes
                    }
                    outputScss_1 = generateScssContent(colorFiles);
                    return [4 /*yield*/, fs.promises.readFile(CONFIG.PATHS.OUTPUT, CONFIG.FILE_ENCODING).catch(function () { return ""; })];
                case 3:
                    currentContent = _a.sent();
                    if (!(currentContent !== outputScss_1)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fs.promises.writeFile(CONFIG.PATHS.OUTPUT, outputScss_1, CONFIG.FILE_ENCODING)];
                case 4:
                    _a.sent();
                    // Update cache for all files
                    return [4 /*yield*/, Promise.all(colorFiles.map(function (file) { return updateCache(path.join(CONFIG.PATHS.COLORS, file), outputScss_1); }))];
                case 5:
                    // Update cache for all files
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    if (error_3 instanceof Error) {
                        //console.error("❌ Error generating SCSS:", error.message);
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Debounced version of generateSCSS
var debouncedGenerate = (0, lodash_1.debounce)(generateSCSS, CONFIG.DEBOUNCE_MS);
// Set up file watching with error handling and automatic recovery
var watcher = null;
function setupWatcher() {
    try {
        watcher === null || watcher === void 0 ? void 0 : watcher.close();
        watcher = fs.watch(CONFIG.PATHS.COLORS, function (eventType, filename) {
            if (filename === null || filename === void 0 ? void 0 : filename.endsWith(".scss")) {
                //console.log(`🔄 Detected change in ${filename}, regenerating...`);
                debouncedGenerate();
            }
        });
        watcher.on("error", function (error) {
            //console.error("Watch error:", error.message);
            setTimeout(setupWatcher, 1000); // Retry setup after error
        });
    }
    catch (error) {
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
process.on("SIGINT", function () {
    watcher === null || watcher === void 0 ? void 0 : watcher.close();
    process.exit(0);
});
