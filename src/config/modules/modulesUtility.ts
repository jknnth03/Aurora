import { CONFIG } from "../config";
import {
	AdvancedChildKey,
	GeneralChildKey,
	MasterlistChildKey,
	ModuleKey,
	MODULES,
	NotificationsChildKey,
	ProfileChildKey,
	SecurityChildKey,
	SettingsChildKey,
	TModule,
} from "./modules";

/**
 * Recursively flattens a nested module structure into a single-level object
 * @param modules - Nested module structure to flatten
 * @param parentKey - Key of the parent module (used in recursion)
 * @param parentPath - Path of the parent module (used in recursion)
 * @returns Flattened module structure with concatenated keys
 */

export interface FlattenedModuleEntry {
	ALIAS: TModule["ALIAS"];
	PATH: TModule["PATH"];
	PARENT_PATH?: TModule["PATH"]; // Optional parent path to build hierarchical keys
}
export type FlattenedModules = Record<string, FlattenedModuleEntry>;

export function flattenModules(modules: Record<string, TModule>, parentKey = ""): FlattenedModules {
	const flattened: FlattenedModules = {};

	Object.entries(modules).forEach(([key, value]) => {
		const { ALIAS, PATH, CHILDREN } = value;
		const newKey = parentKey ? `${key}` : key;
		const fullPath = `${PATH}`;

		flattened[newKey] = { ALIAS, PATH: fullPath };

		if (CHILDREN && typeof CHILDREN === "object") {
			Object.assign(flattened, flattenModules(CHILDREN, newKey));
		}
	});

	return flattened;
}

/**
 * Finds a module by its alias or another property
 * @param searchValue - The value to search for
 * @param propertyName - The property to search by (default: 'ALIAS')
 * @returns The module with the matching property value, or undefined if not found
 */
export const findModuleByProperty = <K extends keyof TModule>(
	searchValue: string,
	propertyName: K = "ALIAS" as K
): TModule | undefined => {
	// Search in top-level modules
	for (const key in MODULES) {
		const module = MODULES[key as keyof typeof MODULES];
		if (module[propertyName] === searchValue) {
			return module;
		}

		// Search in child modules if they exist
		if (module.CHILDREN) {
			for (const childKey in module.CHILDREN) {
				const childModule = module.CHILDREN[childKey];
				if (childModule[propertyName] === searchValue) {
					return childModule;
				}
			}
		}
	}

	// Not found
	return undefined;
};
/**
 * Finds a module by its alias
 * @param alias - The alias to search for
 * @returns The module with the matching alias, or undefined if not found
 */
export const findModuleByAlias = (alias: string): TModule | undefined => {
	return findModuleByProperty(alias, "ALIAS");
};

/**
 * Finds a module by its path
 * @param path - The path to search for
 * @returns The module with the matching path, or undefined if not found
 */
export const findModuleByPath = (path: string): TModule | undefined => {
	return findModuleByProperty(path, "PATH");
};

/**
 * Finds the initial path for a given role from configuration
 * @param firstRole - Role identifier to search for
 * @returns Corresponding path from CONFIG.ROUTES or undefined
 */
export const findInitialPath = (firstRole: string) => {
	return Object.values(CONFIG.ROUTES).find((item) => item.ALIAS === firstRole)?.PATH;
};

/**
 * Checks if a path contains a specific alias
 * @param path - Current URL path
 * @param alias - Module alias to search for
 * @returns True if alias is found in path
 */
export const findMatchingAlias = (path: string, alias?: string): boolean => {
	if (!alias) return false;
	return path.includes(alias);
};

/**
 * Checks if a menu item directly matches current path
 * @param path - Current URL path
 * @param item - Menu item to check
 * @returns True if item's alias matches path
 */
export const findDirectMatch = (path: string, item: TModule): boolean => {
	return findMatchingAlias(path, item.PATH);
};

/**
 * Checks if any child of a menu item matches current path
 * @param path - Current URL path
 * @param item - Parent menu item to check
 * @returns True if any child's alias matches path
 */
export const findChildMatch = (path: string, item: TModule): boolean => {
	if (!item.CHILDREN) return false;
	return Object.values(item.CHILDREN).some((child) => findMatchingAlias(path, child.PATH));
};

/**
 * Finds index of active main menu item
 * @param path - Current URL path
 * @param modules - Array of menu items
 * @returns Index of active item or 0
 */
export const findActiveMainIndex = (path: string, modules: TModule[]): number => {
	return modules?.findIndex((item) => findDirectMatch(path, item) || findChildMatch(path, item)) || 0;
};

/**
 * Maps active submenu indices for each main menu item
 * @param path - Current URL path
 * @param modules - Array of menu items
 * @returns Object mapping main menu indices to active submenu indices
 */
export const findActiveSubIndices = (path: string, modules: TModule[]): { [key: number]: number | null } => {
	const indices: { [key: number]: number | null } = {};

	modules.forEach((module, index) => {
		const activeSubItem = module.CHILDREN
			? Object.values(module.CHILDREN).findIndex((sub) => {
					return findMatchingAlias(path, sub.PATH);
			  })
			: null;
		indices[index] = activeSubItem !== -1 ? activeSubItem : null;
	});

	return indices;
};

function getModuleAliases(modules: Record<string, TModule>): string[] {
	const aliases: string[] = [];

	for (const key in modules) {
		const module = modules[key];

		aliases.push(module.ALIAS);

		if (module.CHILDREN && Object.keys(module.CHILDREN).length > 0) {
			for (const childKey in module.CHILDREN) {
				const childModule = module.CHILDREN[childKey];
				aliases.push(childModule.ALIAS);
			}
		}
	}

	return aliases;
}

// Example usage
export const moduleAliases = getModuleAliases(MODULES);

export const getParentModuleKey = (alias: string): string | null => {
	for (const [key, module] of Object.entries(MODULES)) {
		if (module.ALIAS === alias) {
			return key;
		}

		if ("CHILDREN" in module && module.CHILDREN && typeof module.CHILDREN === "object") {
			for (const childModule of Object.values(module.CHILDREN)) {
				if (childModule.ALIAS === alias) {
					return key;
				}
			}
		}
	}

	return null;
};

export interface GroupedPermission {
	group: string;
	alias: string;
	path: string;
}

/**
 * Extracts and groups permissions based on module hierarchy.
 * If a module has children, it groups them under the parent.
 *
 * @returns {GroupedPermission[]} - Array of grouped permissions.
 */
export const getGroupedPermissions = (): GroupedPermission[] => {
	const groupedPermissions: GroupedPermission[] = [];

	Object.entries(MODULES).forEach(([_, module]) => {
		// If module has children, group them under the parent
		if (module.CHILDREN) {
			Object.entries(module.CHILDREN).forEach(([_, child]) => {
				groupedPermissions.push({
					group: module.ALIAS,
					alias: child.ALIAS,
					path: child.PATH,
				});
			});
		} else {
			// If no children, group it under itself
			groupedPermissions.push({
				group: module.ALIAS,
				alias: module.ALIAS,
				path: module.PATH,
			});
		}
	});

	return groupedPermissions;
};

export const getIconGroupedPermissions = () => {
	return Object.values(MODULES).flatMap((module) => {
		// Include both main module and children permissions
		const moduleData = [
			{
				group: module.ALIAS,
				alias: module.ALIAS,
				ICON: module.ICON,
				ICON_ON: module.ICON_ON,
			},
		];

		if (module.CHILDREN) {
			moduleData.push(
				...Object.values(module.CHILDREN).map((child) => ({
					group: module.ALIAS,
					alias: child.ALIAS,
					ICON: child.ICON,
					ICON_ON: child.ICON_ON,
				}))
			);
		}

		return moduleData;
	});
};

// Helper function to access MODULES with type safety
export function getModule(key: ModuleKey): TModule {
	return MODULES[key];
}

// Helper function to access MASTERLIST children with type safety
export function getMasterlistChild(key: MasterlistChildKey): TModule {
	return MODULES.MASTERLIST.CHILDREN[key];
}

// Helper function to access SETTINGS children with type safety
export function getSettingsChild(key: SettingsChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN[key];
}

// Helper function to access GENERAL children with type safety
export function getGeneralChild(key: GeneralChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN.GENERAL.CHILDREN[key];
}

// Helper function to access PROFILE children with type safety
export function getProfileChild(key: ProfileChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN.PROFILE.CHILDREN[key];
}

// Helper function to access NOTIFICATIONS children with type safety
export function getNotificationsChild(key: NotificationsChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN.NOTIFICATIONS.CHILDREN[key];
}

// Helper function to access SECURITY children with type safety
export function getSecurityChild(key: SecurityChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN.SECURITY.CHILDREN[key];
}

// Helper function to access ADVANCED children with type safety
export function getAdvancedChild(key: AdvancedChildKey): TModule {
	return MODULES.SETTINGS.CHILDREN.ADVANCED.CHILDREN[key];
}
