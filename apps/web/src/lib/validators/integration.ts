import { z } from "zod";

export const neonCredentialsSchema = z.object({
  apiKey: z.string().min(10, "Invalid API key"),
  projectId: z
    .string()
    .min(5, "Invalid project ID")
    .regex(/^[a-z]+-[a-z]+-\d+$/, "Project ID format: adjective-noun-number"),
});

export type NeonCredentialsInput = z.infer<typeof neonCredentialsSchema>;
