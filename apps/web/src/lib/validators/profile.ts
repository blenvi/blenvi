import { z } from "zod";

function trimEmpty(s: string | undefined) {
  const t = s?.trim();
  return t === "" || t === undefined ? undefined : t;
}

export const updateProfileSchema = z
  .object({
    display_name: z.string().max(120, "Max 120 characters"),
    avatar_url: z.string().max(2048),
  })
  .superRefine((val, ctx) => {
    const url = trimEmpty(val.avatar_url);
    if (url === undefined) return;
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Avatar URL must use https",
          path: ["avatar_url"],
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid URL",
        path: ["avatar_url"],
      });
    }
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
