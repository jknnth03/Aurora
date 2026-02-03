// UCrypto.ts
import CryptoJS from "crypto-js";
import { CONFIG } from "../config/config";

/**
 * Interface for encryption/decryption options
 */
interface CryptoOptions {
	secret: string;
	salt: string;
}

/**
 * Get encryption/decryption options from configuration
 * @returns CryptoOptions with secret and salt keys
 */
function getCryptoOptions(): CryptoOptions {
	const options: CryptoOptions = {
		secret: CONFIG.SECRET_KEY || "",
		salt: CONFIG.SALT_KEY || "",
	};

	if (!options.secret || !options.salt) {
		//console.warn("Crypto configuration is incomplete. Secret or salt is missing.");
	}

	return options;
}

/**
 * Encrypts a string value
 * @param value - The string to encrypt
 * @returns The encrypted string
 */
export function encrypt(value: string): string {
	try {
		const { secret, salt } = getCryptoOptions();

		if (!value) {
			throw new Error("Value to encrypt cannot be empty");
		}

		const key = CryptoJS.PBKDF2(secret, CryptoJS.enc.Utf8.parse(salt), {
			keySize: 256 / 32,
			iterations: 1000,
		});

		const encrypted = CryptoJS.AES.encrypt(value, key.toString());
		return encrypted.toString();
	} catch (error) {
		//console.error("Encryption error:", error);
		// Return a safe fallback or throw an error depending on your error handling strategy
		return "";
	}
}

/**
 * Decrypts an encrypted string
 * @param encryptedValue - The encrypted string to decrypt
 * @returns The decrypted string
 */
export function decrypt(encryptedValue: string): string {
	try {
		const { secret, salt } = getCryptoOptions();

		if (!encryptedValue) {
			throw new Error("Value to decrypt cannot be empty");
		}

		const key = CryptoJS.PBKDF2(secret, CryptoJS.enc.Utf8.parse(salt), {
			keySize: 256 / 32,
			iterations: 1000,
		});

		const decrypted = CryptoJS.AES.decrypt(encryptedValue, key.toString());
		return decrypted.toString(CryptoJS.enc.Utf8);
	} catch (error) {
		//console.error("Decryption error:", error);
		// Return a safe fallback or throw an error depending on your error handling strategy
		return "";
	}
}

/**
 * Hashes a string using SHA-256
 * @param value - The string to hash
 * @returns The hashed string
 */
export function hashString(value: string): string {
	try {
		if (!value) {
			throw new Error("Value to hash cannot be empty");
		}

		return CryptoJS.SHA256(value).toString();
	} catch (error) {
		//console.error("Hashing error:", error);
		return "";
	}
}
export function encryptString({
	input,
	percentToEncrypt = 90,
	replacementChar = " •",
	maxLength = 10,
	show,
}: {
	input: string;
	percentToEncrypt?: number;
	replacementChar?: string;
	maxLength?: number;
	show?: boolean;
}): string {
	if (show) {
		return input;
	}

	if (typeof input !== "string") {
		throw new Error("Input must be a string");
	}

	if (percentToEncrypt < 0 || percentToEncrypt > 100) {
		throw new Error("percentToEncrypt must be between 0 and 100");
	}

	// Determine how many characters to keep visible
	const visibleCount: number = Math.max(1, Math.ceil(maxLength * ((100 - percentToEncrypt) / 100)));

	// Create masked string
	const masked: string = input.slice(0, visibleCount).padEnd(maxLength, replacementChar);

	// Trim to maxLength to ensure exact length
	return masked.slice(0, maxLength);
}
