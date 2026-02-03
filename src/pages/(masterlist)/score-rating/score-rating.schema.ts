import { z } from "zod";

export const scoreRatingSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Please enter a rating"),
  score: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Please enter a score")
    .max(100, "Score rating must be 1 - 100"),
});
