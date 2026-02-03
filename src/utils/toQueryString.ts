/**
 * Converts an object of page state parameters to a URL query string with leading "?"
 * @param params - Object containing page state parameters
 * @returns URL query string with leading "?" or empty string if no params
 */
export function toQueryString(params: Record<string, string>): string {
	// Use URLSearchParams for proper URL encoding
	const searchParams = new URLSearchParams(params);

	// Convert to string and add leading '?'
	const queryString = searchParams.toString();

	// Return with '?' prefix, or empty string if there are no parameters
	return queryString ? `?${queryString}` : "";
}

// Example usage:
// const pageState = { "page": "0", "per_page": "10" };
// const queryString = toQueryString(pageState);
// Result: "?page=0&per_page=10"
