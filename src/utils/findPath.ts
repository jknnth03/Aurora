import { TModule } from "../config/modules/modules";

export function findPathObject(data: Record<string, TModule>, fullPath: string): TModule[] {
	const segments = fullPath.split("/").filter(Boolean); // e.g., ["masterlist", "users", "role"]

	function search(modules: Record<string, TModule>, remaining: string[]): TModule[] {
		for (const key in modules) {
			const mod = modules[key];
			const modSegment = mod.PATH?.split("/").filter(Boolean).pop(); // Get last path part

			if (modSegment === remaining[0]) {
				const matched: TModule[] = [mod];

				if (remaining.length > 1 && mod.CHILDREN) {
					const childMatch = search(mod.CHILDREN, remaining.slice(1));
					return [...matched, ...childMatch];
				}

				return matched;
			}

			// Recurse deeper even if this module doesn't match (for nested paths)
			if (mod.CHILDREN) {
				const deeperMatch = search(mod.CHILDREN, remaining);
				if (deeperMatch.length > 0) return deeperMatch;
			}
		}

		return [];
	}

	return search(data, segments);
}
