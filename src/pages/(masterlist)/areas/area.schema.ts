import { z } from "zod";

export const areaSchema = z.object({
  name: z.string(),
  region: z.object({
    id: z.number(),
    name: z.string(),
  }),
  area_head: z.object({
    id: z.number(),
    full_name: z.string(),
  }),
});
