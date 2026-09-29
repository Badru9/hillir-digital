import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(32, "Username maksimal 32 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore",
    ),
  email: z.email("Format email tidak valid").max(255, "Email terlalu panjang"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(72, "Kata sandi maksimal 72 karakter"),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

const rupiahAmount = z
  .number()
  .finite("Nilai harus berupa angka")
  .nonnegative("Nilai tidak boleh negatif");

export const calculationSchema = z.object({
  productPrice: rupiahAmount,
  averageOrderValue: rupiahAmount,
  adSpend: z
    .number()
    .finite("Nilai harus berupa angka")
    .positive("Pengeluaran harus lebih dari 0"),
  costPerResult: z
    .number()
    .finite("Nilai harus berupa angka")
    .positive("CPR harus lebih dari 0"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CalculationInput = z.infer<typeof calculationSchema>;

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Data tidak valid";
}
