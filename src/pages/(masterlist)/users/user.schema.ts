import { z } from "zod";

export const personalInfoPayloadSchema = z.object({
	id_prefix: z.string().min(1, "ID prefix is required").max(10, "ID prefix must be 10 characters or less"),
	id_no: z.string().min(1, "ID number is required").max(20, "ID number must be 20 characters or less"),
	first_name: z
		.string()
		.min(1, "First name is required")
		.max(50, "First name must be 50 characters or less")
		.regex(
			/^[a-zA-Z0-9_.\-ñÑáéíóúÁÉÍÓÚüÜ' ]+$/,
			"First Name can contain letters, numbers, underscores, periods, hyphens, and common name characters"
		),
	middle_name: z
		.string()
		.max(50, "Middle name must be 50 characters or less")
		.regex(
			/^[a-zA-Z0-9_.\-ñÑáéíóúÁÉÍÓÚüÜ' ]+$/,
			"Middle Name can contain letters, numbers, underscores, periods, hyphens, and common name characters"
		)
		.optional()
		.or(z.literal("")), // Allow empty string

	last_name: z
		.string()
		.min(1, "Last name is required")
		.max(50, "Last name must be 50 characters or less")
		.regex(
			/^[a-zA-Z0-9_.\-ñÑáéíóúÁÉÍÓÚüÜ' ]+$/,
			"Last Name can contain letters, numbers, underscores, periods, hyphens, and common name characters"
		),
	suffix: z
		.string()
		.max(10, "Suffix must be 10 characters or less")
		.regex(/^[a-zA-Z.\s]*$/, "Suffix must contain only letters, periods, and spaces")
		.optional()
		.or(z.literal("")), // Allow empty string

	mobile_number: z
		.union([
			z.literal(undefined),
			z.literal(""),
			z
				.string()
				.min(10, "Mobile number must be at least 10 digits")
				.regex(
					/^(\+63|63|0)?[89]\d{9}$/,
					"Please enter a valid Philippine mobile number (e.g., +639123456789 or 09123456789)"
				),
		])
		.optional(),
	gender: z.string().min(1, "Gneder is required").max(50, "Gender must be 50 characters or less"),

	one_charging_id: z
		.number()
		.int("One charging ID must be a whole number")
		.positive("One charging ID must be a positive number"),
});

// User Payload Validation Schema (for CREATE)
export const userPayloadSchema = z.object({
	personal_info: personalInfoPayloadSchema,

	username: z
		.string()
		.min(3, "Username must be at least 3 characters long")
		.max(30, "Username must be 30 characters or less")
		.regex(
			/^[a-zA-Z0-9_.\-ñÑáéíóúÁÉÍÓÚüÜ' ]+$/,
			"Username can contain letters, numbers, underscores, periods, hyphens, and common name characters"
		)

		.regex(/^[a-zA-Z]/, "Username must start with a letter"),

	role_id: z.number().int("Role ID must be a whole number").positive("Role ID must be a positive number"),
});

// User Update Payload Schema (for EDIT/PATCH operations)
export const userUpdatePayloadSchema = z
	.object({
		personal_info: personalInfoPayloadSchema.partial().optional(),
		username: userPayloadSchema.shape.username.optional(),
		role_id: userPayloadSchema.shape.role_id.optional(),
	})
	.refine(
		(data) => {
			// At least one field must be provided for update
			const hasPersonalInfo = data.personal_info && Object.keys(data.personal_info).length > 0;
			const hasUsername = data.username !== undefined;
			const hasRoleId = data.role_id !== undefined;

			return hasPersonalInfo || hasUsername || hasRoleId;
		},
		{
			message: "At least one field must be provided for update",
			path: [], // This will show the error at the root level
		}
	);

export type PersonalInfoPayloadSchema = z.infer<typeof personalInfoPayloadSchema>;

export type UserPayloadSchema = z.infer<typeof userPayloadSchema>;

export type UserUpdatePayloadSchema = z.infer<typeof userUpdatePayloadSchema>;

export const validateMobileNumber = (value: string): boolean => {
	const mobileRegex = /^\+639\d{9}$/;

	return mobileRegex.test(value);
};
