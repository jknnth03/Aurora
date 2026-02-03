export const formatShortcut = (shortcut: string): string => {
	return shortcut
		.split("+")
		.map((key) => key.trim().toUpperCase())
		.join(" + ");
};
