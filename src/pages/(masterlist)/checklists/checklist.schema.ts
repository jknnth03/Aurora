import { z } from "zod";

export const optionsSchema = z
  .array(
    z.object({
      id: z.number().or(z.string()).optional(),
      option_text: z.string().min(1, "An option is required"),
      order_index: z.number(),
    }),
  )
  .refine((value) => value.length >= 2, {
    message: "Please provide atleast 2 options",
  });

export const paragraphOptionSchema = z.array(
  z.object({
    id: z.number().or(z.string()).optional(),
    option_text: z.string().min(1, "An option is required"),
    order_index: z.number(),
  }),
);

export type IOption = z.infer<typeof optionsSchema>;

export const questionsSchema = z
  .array(
    z.discriminatedUnion("question_type", [
      z.object({
        id: z.number().or(z.string()).optional(),
        question_text: z.string().min(1, "Question is required"),
        question_type: z.literal("multiple_choice"),
        order_index: z.number(),
        options: optionsSchema,
      }),
      z.object({
        id: z.number().or(z.string()).optional(),
        question_text: z.string().min(1, "Question is required"),
        question_type: z.literal("checkboxes"),
        order_index: z.number(),
        options: optionsSchema,
      }),
      z.object({
        id: z.number().or(z.string()).optional(),
        question_text: z.string().min(1, "Question is required"),
        question_type: z.literal("paragraph"),
        order_index: z.number(),
        options: paragraphOptionSchema,
      }),
    ]),
  )
  .refine((val) => val.length >= 1, "At least one question is required");

export type IQuestion = z.infer<typeof questionsSchema>;

export const sectionsSchema = z
  .array(
    z.object({
      id: z.number().or(z.string()).optional(),
      title: z.string().min(1, "Please provide a title"),
      category: z.string(),
      category_id: z.number().nullable(),
      order_index: z.number(),
      questions: questionsSchema,
    }),
    { required_error: "Section title is required" },
  )
  .min(1, "At least one section is required");

export type ISchema = z.infer<typeof sectionsSchema>;

export const checklistPayloadSchema = z.object({
  name: z.string().min(1, "Please enter the checklist name"),
  sections: sectionsSchema,
});

export type ChecklistSchema = z.infer<typeof checklistPayloadSchema>;

export type ChecklistPayloadSchema = {
  name: string;
  sections: {
    title: string;
    category: string;
    category_id: number | null;
    order_index: number;
    questions: {
      options: {
        order_index: number;
        option_text: string;
      }[];
      order_index: number;
      question_text: string;
      question_type: "multiple_choice" | "checkboxes" | "paragraph";
    }[];
  }[];
};
