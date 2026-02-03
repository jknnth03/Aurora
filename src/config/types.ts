// config-types.ts
import { TModule } from "./modules/modules";

/**
 * Environment type definition
 */
export type Environment = "local" | "development" | "production";

/**
 * Base URL configuration for each environment
 */
export interface BaseUrlConfig {
	CEDAR_ENDPOINT: string;
	INVENTORY_ENDPOINT: string;
	UM_ENDPOINT: string;
	VLAD_ENDPOINT: string;
	AURORA_ENDPOINT: string;
	ELIXIR_ENDPOINT: string;

	CEDAR_BEARER_TOKEN: string;
	VLAD_BEARER_TOKEN: string;
	VLAD_ASSET_BEARER_TOKEN: string;
	ELIXIR_BEARER_TOKEN: string;

	SALT_KEY: string;
	SECRET: string;
}

/**
 * Button configuration interface
 */
export interface ButtonConfig {
	name: string;
	label: string;
	description: string;
}

/**
 * Field configuration interface
 */
export interface FieldConfig {
	name: string;
	label: string;
	placeholder: string;
	description: string;
	required?: string;
}

/**
 * Table header configuration
 */
export interface HeaderConfig {
	key: string;
	label: string;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
	LABEL: string;
	EXPIRATION?: number;
}

/**
 * Text configuration for specific sections
 */
export interface TextConfig {
	label: string;
	description: string;
}

/**
 * Complete configuration interface
 */
export interface AppConfig {
	APP_NAME: string;
	ENV: Environment;
	DESCRIPTIONS: {
		APP: string;
		PALETTE_PICKER_TITLE: string;
		PALETTE_PICKER_TOOLTIP_TITLE: string;
		PALETTE_PICKER_TOOLTIP_SUBTITLE: string;
	};
	TEXTS: {
		LOGIN: TextConfig;
		ALTERNATIVE_THEME: TextConfig;
	};
	COOKIE: {
		SESSION: StorageConfig;
	};
	STORAGE: {
		DARK_MODE: StorageConfig;
		SYSTEM_COLOR: StorageConfig;
	};
	BUTTONS: Record<string, ButtonConfig>;
	FIELDS: Record<string, FieldConfig>;
	CHART_OF_ACCOUNTS_KEYS: {
		BUSINESS_UNIT: string;
		COMPANY: string;
		DEPARTMENT: string;
		DEPARTMENT_UNITS: string;
		LOCATION: string;
		SUB_UNIT: string;
	};
	STATUSES: Record<string, string>;
	HEADERS: {
		USERS: HeaderConfig[];
	};
	VERSION: number;
	BASE_URL: Record<Environment, BaseUrlConfig>;
	ENDPOINTS: Record<string, string>;
	ROUTES: Record<string, TModule>;
}
