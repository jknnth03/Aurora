import { z } from "zod";

export const regionSchema = z.object({
  name: z.string(),
  region_head: z.object({
    id: z.number(),
    full_name: z.string(),
  }),
});
