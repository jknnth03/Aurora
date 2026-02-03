// UCookie.ts
/**
 * Cookie options interface
 */
interface CookieOptions {
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: "strict" | "lax" | "none";
	expires?: number | Date;
	httpOnly?: boolean;
	maxAge?: number;
}

/**
 * Cookie data interface for getAllCookies return type
 */
interface CookieData {
	name: string;
	value: string;
	encodedName: string;
	encodedValue: string;
}

/**
 * Set a cookie with the given name, value, and options
 * @param name - The name of the cookie
 * @param value - The value to store in the cookie
 * @param options - Cookie options like expiration, path, etc.
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
	if (!name) {
		//console.error("Cookie name cannot be empty");
		return;
	}

	try {
		let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

		if (options.expires) {
			const expirationDate =
				options.expires instanceof Date
					? options.expires
					: new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);

			cookieString += `; expires=${expirationDate.toUTCString()}`;
		}

		if (options.maxAge !== undefined) {
			cookieString += `; max-age=${options.maxAge}`;
		}

		if (options.path) {
			cookieString += `; path=${options.path}`;
		} else {
			cookieString += "; path=/"; // Default to root path if not specified
		}

		if (options.domain) {
			cookieString += `; domain=${options.domain}`;
		}

		if (options.secure) {
			cookieString += "; secure";
		}

		if (options.sameSite) {
			cookieString += `; samesite=${options.sameSite}`;
		}

		if (options.httpOnly) {
			cookieString += "; httpOnly";
		}

		document.cookie = cookieString;
	} catch (error) {
		//console.error("Error setting cookie:", error);
	}
}

/**
 * Get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or empty string if not found
 */
export function getCookie(name: string): string {
	if (!name) {
		//console.error("Cookie name cannot be empty");
		return "";
	}

	try {
		const cookies = document.cookie.split(";");
		const encodedName = encodeURIComponent(name);

		for (const cookie of cookies) {
			const [cookieName, cookieValue] = cookie.trim().split("=");

			if (cookieName === encodedName || cookieName === name) {
				return cookieValue ? decodeURIComponent(cookieValue) : "";
			}
		}

		return "";
	} catch (error) {
		//console.error("Error getting cookie:", error);
		return "";
	}
}

/**
 * Get all cookies as an object with decoded names and values
 * @param includeRawData - Whether to include raw encoded data in the response
 * @returns Object with cookie names as keys and values as cookie values, or detailed CookieData array if includeRawData is true
 */
export function getAllCookies(includeRawData?: boolean): Record<string, string> | CookieData[] {
	try {
		const cookies = document.cookie.split(";");

		if (includeRawData) {
			const cookieDataArray: CookieData[] = [];

			for (const cookie of cookies) {
				const [encodedName, encodedValue = ""] = cookie.trim().split("=");

				if (encodedName) {
					try {
						const decodedName = decodeURIComponent(encodedName);
						const decodedValue = encodedValue ? decodeURIComponent(encodedValue) : "";

						cookieDataArray.push({
							name: decodedName,
							value: decodedValue,
							encodedName: encodedName,
							encodedValue: encodedValue,
						});
					} catch (decodeError) {
						// If decoding fails, use the original encoded values
						cookieDataArray.push({
							name: encodedName,
							value: encodedValue,
							encodedName: encodedName,
							encodedValue: encodedValue,
						});
					}
				}
			}

			return cookieDataArray;
		} else {
			const cookieObject: Record<string, string> = {};

			for (const cookie of cookies) {
				const [cookieName, cookieValue = ""] = cookie.trim().split("=");

				if (cookieName) {
					try {
						const decodedName = decodeURIComponent(cookieName);
						const decodedValue = cookieValue ? decodeURIComponent(cookieValue) : "";
						cookieObject[decodedName] = decodedValue;
					} catch (decodeError) {
						// If decoding fails, use the original encoded values
						cookieObject[cookieName] = cookieValue;
					}
				}
			}

			return cookieObject;
		}
	} catch (error) {
		//console.error("Error getting all cookies:", error);
		return includeRawData ? [] : {};
	}
}

/**
 * Get all cookie names (decoded)
 * @returns Array of cookie names
 */
export function getAllCookieNames(): string[] {
	try {
		const cookies = document.cookie.split(";");
		const cookieNames: string[] = [];

		for (const cookie of cookies) {
			const cookieName = cookie.trim().split("=")[0];

			if (cookieName) {
				try {
					const decodedName = decodeURIComponent(cookieName);
					cookieNames.push(decodedName);
				} catch (decodeError) {
					// If decoding fails, use the original encoded name
					cookieNames.push(cookieName);
				}
			}
		}

		return cookieNames;
	} catch (error) {
		//console.error("Error getting cookie names:", error);
		return [];
	}
}

/**
 * Check if a cookie exists
 * @param name - The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export function cookieExists(name: string): boolean {
	if (!name) {
		return false;
	}

	try {
		const cookies = document.cookie.split(";");
		const encodedName = encodeURIComponent(name);

		for (const cookie of cookies) {
			const cookieName = cookie.trim().split("=")[0];

			if (cookieName === encodedName || cookieName === name) {
				return true;
			}
		}

		return false;
	} catch (error) {
		//console.error("Error checking cookie existence:", error);
		return false;
	}
}

/**
 * Remove a cookie by setting its expiration date to the past
 * @param name - The name of the cookie to remove
 * @param options - Cookie options for domain and path
 */
export function removeCookie(name: string, options: Pick<CookieOptions, "path" | "domain"> = {}): void {
	if (!name) {
		//console.error("Cookie name cannot be empty");
		return;
	}

	try {
		// Set expiration to a date in the past to delete the cookie
		setCookie(name, "", {
			...options,
			expires: new Date(0),
		});
	} catch (error) {
		//console.error("Error removing cookie:", error);
	}
}

/**
 * Remove all cookies accessible from the current path
 * @param options - Cookie options for domain and path
 */
export function removeAllCookies(options: Pick<CookieOptions, "path" | "domain"> = {}): void {
	try {
		const cookieNames = getAllCookieNames();

		for (const cookieName of cookieNames) {
			removeCookie(cookieName, options);
		}
	} catch (error) {
		//console.error("Error removing all cookies:", error);
	}
}

/**
 * Remove all cookies except the specified ones
 * @param exceptions - Array of cookie names to keep (decoded names)
 * @param options - Cookie options for domain and path
 */
export function clearAllCookiesExcept(
	exceptions: string[],
	options: Pick<CookieOptions, "path" | "domain"> = {}
): void {
	if (!Array.isArray(exceptions)) {
		//console.error("Exceptions must be an array of cookie names");
		return;
	}

	try {
		const allCookies = getAllCookies(true) as CookieData[]; // Get detailed cookie data
		for (const cookieData of allCookies) {
			// Check if this cookie should be kept (check both encoded and decoded names)
			const shouldKeep = exceptions.includes(cookieData.name) || exceptions.includes(cookieData.encodedName);

			if (shouldKeep) {
				console.log(`Keeping cookie: ${cookieData.name} (${cookieData.encodedName})`);
				continue;
			}

			console.log(`Removing cookie: ${cookieData.name} (${cookieData.encodedName})`);
			removeCookie(cookieData.name, options);
		}
	} catch (error) {
		//console.error("Error clearing cookies except specified ones:", error);
	}
}
