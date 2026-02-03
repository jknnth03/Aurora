import { z } from "zod";

export const storeChecklistSchema = z.object({
  store_id: z.number().min(1, { message: "Store is required" }),
  store: z
    .object({
      id: z.number(),
      code: z.string().nullable(),
      name: z.string().nullable(),
      region: z.object({
        id: z.number(),
        name: z.string(),
        region_head_id: z.number(),
        region_head: z
          .object({
            id: z.number(),
            full_name: z.string(),
            user_status: z.string(),
          })
          .nullable(),
        created_at: z.string(),
        updated_at: z.string(),
        deleted_at: z.string().nullable(),
        areas: z.string().nullable(),
      }),
      area: z.object({
        id: z.number(),
        name: z.string(),
        region: z.object({
          id: z.number(),
          name: z.string(),
        }),
        area_head: z.object({
          id: z.number(),
          full_name: z.string(),
          user_status: z.string(),
        }),
      }),
      created_at: z.string(),
      updated_at: z.string(),
      deleted_at: z.string().nullable(),
    })
    .refine((store) => store.id > 0, { message: "Store is required" }),
  checklist_id: z.number().min(1, { message: "Checklist is required" }),
  checklist: z
    .object({
      id: z.number(),
      name: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
      deleted_at: z.string().nullable(),
      sections: z.array(
        z.object({
          id: z.number(),
          checklist_id: z.number(),
          title: z.string(),
          order_index: z.number(),
          created_at: z.string(),
          updated_at: z.string(),
          deleted_at: z.string().nullable(),
          questions: z
            .array(
              z.object({
                id: z.number(),
                section_id: z.number(),
                question_text: z.string(),
                question_type: z.enum([
                  "multiple_choice",
                  "checkboxes",
                  "paragraph",
                ]),
                order_index: z.number(),
                created_at: z.string(),
                updated_at: z.string(),
                deleted_at: z.string().nullable(),
                options: z.array(
                  z.object({
                    id: z.number(),
                    question_id: z.number(),
                    option_text: z.string(),
                    order_index: z.number(),
                    created_at: z.string(),
                    updated_at: z.string(),
                    deleted_at: z.string().nullable(),
                  })
                ),
              })
            )
            .optional(),
        })
      ),
    })
    .refine((checklist) => checklist.id > 0, {
      message: "Checklist is required",
    }),
});

export type StoreChecklistPayload = {
  store_id: number;
  store_name: string;
  checklist_id: number;
  checklist_name: string;
};
export type StoreChecklistSchema = z.infer<typeof storeChecklistSchema>;
