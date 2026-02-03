import {
	ArrowCounterClockwise,
	Bug,
	ChartBar,
	CheckCircle,
	Database,
	Eye,
	FileText,
	Fire,
	Gear,
	Globe,
	Icon,
	Lightning,
	Package,
	Palette,
	Recycle,
	Rocket,
	Shield,
	Sparkle,
	Translate,
	Warning,
	Wrench,
} from "@phosphor-icons/react";

export const PATCH_NOTE_TYPES = {
	// New Features & Additions
	feature: {
		label: "New Feature",
		icon: Sparkle,
		color: "#10B981", // emerald-500
		description: "A new feature or enhancement",
	},

	// Bug Fixes
	bugfix: {
		label: "Bug Fix",
		icon: Bug,
		color: "#EF4444", // red-500
		description: "A bug fix or error correction",
	},

	// Documentation
	docs: {
		label: "Documentation",
		icon: FileText,
		color: "#3B82F6", // blue-500
		description: "Documentation updates or additions",
	},

	// UI/UX & Styling
	style: {
		label: "Style & UI",
		icon: Palette,
		color: "#8B5CF6", // violet-500
		description: "UI/UX improvements and styling changes",
	},

	// Code Refactoring
	refactor: {
		label: "Refactor",
		icon: Recycle,
		color: "#F59E0B", // amber-500
		description: "Code refactoring and structure improvements",
	},

	// Performance Improvements
	perf: {
		label: "Performance",
		icon: Lightning,
		color: "#FBBF24", // yellow-400
		description: "Performance optimizations and improvements",
	},

	// Testing
	testing: {
		label: "Testing",
		icon: CheckCircle,
		color: "#059669", // emerald-600
		description: "Adding or updating tests",
	},

	// Maintenance & Chores
	chore: {
		label: "Maintenance",
		icon: Wrench,
		color: "#6B7280", // gray-500
		description: "Maintenance tasks and general chores",
	},

	// Security
	security: {
		label: "Security",
		icon: Shield,
		color: "#DC2626", // red-600
		description: "Security fixes and improvements",
	},

	// Deployment & Release
	deploy: {
		label: "Deployment",
		icon: Rocket,
		color: "#7C3AED", // violet-600
		description: "Deployment and release related changes",
	},

	// Breaking Changes
	breaking: {
		label: "Breaking Change",
		icon: Warning,
		color: "#EA580C", // orange-600
		description: "Breaking changes that may affect existing functionality",
	},

	// Dependencies
	dependencies: {
		label: "Dependencies",
		icon: Package,
		color: "#0891B2", // cyan-600
		description: "Adding, updating, or removing dependencies",
	},

	// Configuration
	config: {
		label: "Configuration",
		icon: Gear,
		color: "#4B5563", // gray-600
		description: "Configuration changes and updates",
	},

	// Database
	database: {
		label: "Database",
		icon: Database,
		color: "#059669", // emerald-600
		description: "Database schema changes and migrations",
	},

	// API Changes
	api: {
		label: "API",
		icon: Globe,
		color: "#0D9488", // teal-600
		description: "API changes and endpoint updates",
	},

	// Accessibility
	a11y: {
		label: "Accessibility",
		icon: Eye,
		color: "#7C2D12", // orange-800
		description: "Accessibility improvements and fixes",
	},

	// Analytics & Tracking
	analytics: {
		label: "Analytics",
		icon: ChartBar,
		color: "#1D4ED8", // blue-700
		description: "Analytics and tracking implementations",
	},

	// Internationalization
	i18n: {
		label: "Internationalization",
		icon: Translate,
		color: "#BE185D", // pink-600
		description: "Internationalization and localization updates",
	},

	// Hotfix
	hotfix: {
		label: "Hotfix",
		icon: Fire,
		color: "#DC2626", // red-600
		description: "Critical hotfixes for production issues",
	},

	// Rollback
	rollback: {
		label: "Rollback",
		icon: ArrowCounterClockwise,
		color: "#9333EA", // purple-600
		description: "Rolling back previous changes",
	},
} as const;

// Type definitions
export type PatchNoteType = keyof typeof PATCH_NOTE_TYPES;

export interface PatchNoteTypeConfig {
	label: string;
	icon: Icon;
	color: string;
	description: string;
}

// Helper function to get type configuration
export const getPatchNoteTypeConfig = (type: string): PatchNoteTypeConfig | null => {
	return PATCH_NOTE_TYPES[type as PatchNoteType] || null;
};
// Get type configuration from our config
export const getTypeInfo = (type: string) => {
	const typeConfig = getPatchNoteTypeConfig(type);
	if (typeConfig) {
		return {
			label: typeConfig.label,
			color: typeConfig.color,
			icon: typeConfig.icon,
			description: typeConfig.description,
		};
	}

	// Fallback for unknown types - log for debugging
	console.warn(`Unknown patch note type: ${type}`);
	return {
		label: type.charAt(0).toUpperCase() + type.slice(1),
		color: "#6B7280", // gray-500
		icon: null,
		description: "",
	};
};

// Create a styled chip component with proper colors

// Get all available types as array
export const getAllPatchNoteTypes = (): Array<{ key: PatchNoteType; config: PatchNoteTypeConfig }> => {
	return Object.entries(PATCH_NOTE_TYPES).map(([key, config]) => ({
		key: key as PatchNoteType,
		config,
	}));
};
