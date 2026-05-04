import { z } from "zod";

import { validateNeonConsoleCredentials } from "@/services/integrations/neon-input";

/** Updating Neon credentials: API key optional (blank keeps the stored key). */
export const neonUpdateSchema = z
  .object({
    neonApiKey: z.string(),
    neonProjectId: z.string().min(1, "Project ID is required."),
  })
  .superRefine((val, ctx) => {
    const key = val.neonApiKey.trim();
    const pid = val.neonProjectId.trim();
    if (!pid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project ID is required.",
        path: ["neonProjectId"],
      });
      return;
    }
    if (key) {
      const err = validateNeonConsoleCredentials(key, pid);
      if (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
          path: ["neonApiKey"],
        });
      }
    }
  });

export type NeonUpdateInput = z.infer<typeof neonUpdateSchema>;
