export function stringToColor(word: string) {
	let hash = 0;
	for (let i = 0; i < word.length; i++) {
		hash = word.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Generate pastel color components (adjust ranges as needed)
	const r = ((hash & 0xff) % 128) + 128; // Red: 128-255
	const g = (((hash >> 8) & 0xff) % 128) + 128; // Green: 128-255
	const b = (((hash >> 16) & 0xff) % 128) + 128; // Blue: 128-255

	const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
		.toString(16)
		.padStart(2, "0")}`;

	return color;
}

export const getRandomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function getInitials(word: string = ""): string {
	if (!word.trim()) return "";
	return word
		.normalize("NFD") // Normalize accents (e.g., ñ -> n + ~)
		.replace(/\p{Diacritic}/gu, "") // Remove diacritics
		.replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
		.split(/\s+/) // Split by any whitespace
		.map((w) => w.charAt(0).toUpperCase()) // Get the first letter of each word
		.join("");
}

export function generateUsername(firstName?: string, lastName?: string): string {
	const initials = getInitials(firstName || "");
	const last = lastName
		? lastName
				.normalize("NFD")
				.replace(/\p{Diacritic}/gu, "")
				.toLowerCase()
				.replace(/\s+/g, "")
		: "";
	return `${initials}${last}`;
}

// Function to calculate luminance of a color (for contrast)
function calculateLuminance(hex: string): number {
	// Extract RGB values
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	// Apply the luminance formula
	const a = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
	const luminance = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;

	return luminance;
}

// Function to determine text color based on luminance
export function getTextColorForBackground(hex: string): string {
	const luminance = calculateLuminance(hex);
	return luminance > 0.5 ? "#000000" : "#FFFFFF"; // Return black or white text based on luminance
}

export function stringAvatar(word: string) {
	if (!word || typeof word !== "string") {
		return {
			sx: {
				bgcolor: "#000000",
			},
			children: "NA",
		};
	}

	const initials = getInitials(word);
	const bgcolor = stringToColor(word);

	const textColor = getTextColorForBackground(bgcolor);

	return {
		sx: {
			bgcolor: bgcolor,
			color: textColor,
		},
		children: initials,
	};
}
