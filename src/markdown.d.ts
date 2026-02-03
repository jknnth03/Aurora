// This file declares the types for markdown imports with vite-plugin-markdown
declare module "*.md" {
	// Using "markdown" mode, it returns the raw markdown string
	const content: string;
	export default content;

	// If you use "html" mode in the plugin or advanced features:
	// export const html: string; // HTML string
	// export const attributes: Record<string, any>; // Frontmatter attributes
	// export const toc: { level: number; content: string }[]; // Table of contents
}

// For consistency, include other markdown extensions too
declare module "*.markdown" {
	const content: string;
	export default content;

	// If you use "html" mode in the plugin or advanced features:
	// export const html: string;
	// export const attributes: Record<string, any>;
	// export const toc: { level: number; content: string }[];
}
