import { z } from "zod";

const MAX_UPLOAD_SIZE = 5000000; // 5MB in bytes
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const checkboxSchema = z.array(
  z.object({ answer: z.number(), answer_text: z.string() })
);

export const radioSchema = z.object({
  answer: z.number().or(z.string()),
  answer_text: z.string(),
});

const ResponseAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("checkboxes"),
    data: checkboxSchema,
  }),
  z.object({
    type: z.literal("multiple_choice"),
    data: radioSchema,
  }),
  z.object({
    type: z.literal("paragraph"),
    data: z.string(),
  }),
]);

export const checklistUserSchema = z.object({
  store_visit: z.enum(["1", "0"]).nullable(),
  expired: z.enum(["1", "0"]).nullable(),
  condemned: z.enum(["1", "0"]).nullable(),
  store_duty: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .refine((value) => value.length > 0, "Store duty is required"),
  good_points: z.string().optional(),
  notes: z.string().optional(),
  section: z.array(
    z.object({
      section_id: z.number(),
      section_order_index: z.number(),
      category_id: z.number(),
    })
  ),
  responses: z.array(
    z.object({
      answer: ResponseAnswerSchema.optional().refine(
        (val) => val !== undefined,
        "Answer is required"
      ),
      remarks: z.string().optional(),
      attachment: z
        .instanceof(File, { message: "Attachment must be a File." })
        .or(z.string())
        .refine(
          (file) => file.size <= MAX_UPLOAD_SIZE,
          `Max file size is ${MAX_UPLOAD_SIZE / 1000000}MB.`
        )
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          "Only .jpg, .jpeg, .png, and .webp formats are supported."
        )
        .optional()
        .nullable(),
    })
  ),
});

export type ChecklistUserSchema = z.infer<typeof checklistUserSchema>;
