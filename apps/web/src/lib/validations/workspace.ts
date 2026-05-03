import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  poll_interval_minutes: z
    .number()
    .int()
    .min(1, "At least 1 minute")
    .max(1440, "At most 1440 minutes (24 hours)")
    .optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
