import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[@$!%*?&#]/, "Password must include at least one special character");

export const authBody = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const changePasswordBody = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "Password do not match!",
    path: ["confirmPassword"],
  });

export type LoginAuthSchema = z.infer<typeof authBody>;
export type ChangePasswordSchema = z.infer<typeof changePasswordBody>;
