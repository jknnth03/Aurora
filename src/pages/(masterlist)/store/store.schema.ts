import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  region: z
    .object({
      id: z.number(),
      name: z.string().min(1, "Region is required"),
      region_head_id: z.number(),
      region_head: z.object({
        id: z.number(),
        full_name: z.string(),
      }),
    })
    .required(),
  area: z
    .object({
      id: z.number(),
      name: z.string().min(1, "Area is required"),
      region: z.object({
        id: z.number(),
        name: z.string(),
      }),
      area_head: z.object({
        id: z.number(),
        full_name: z.string(),
      }),
    })
    .required(),
});

export type StoreSchema = z.infer<typeof storeSchema>;
