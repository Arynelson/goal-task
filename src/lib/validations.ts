import { z } from "zod";

export const goalSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  category: z
    .string()
    .min(1, "Please select a category"),
  target_date: z
    .date({
      required_error: "Please select a target date",
    })
    .min(new Date(), "Target date must be in the future"),
  importance_level: z
    .number()
    .min(1, "Importance level must be between 1 and 5")
    .max(5, "Importance level must be between 1 and 5"),
  effort_estimated: z
    .number()
    .min(1, "Effort estimation must be between 1 and 5")
    .max(5, "Effort estimation must be between 1 and 5"),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  priority: z
    .enum(["alta", "media", "baixa"])
    .default("media"),
  due_date: z
    .date()
    .optional(),
  estimated_duration: z
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be less than 8 hours")
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;