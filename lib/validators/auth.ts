import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
