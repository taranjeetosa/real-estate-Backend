import { z } from "zod";
export const pathways = [
  "AI for Real Estate Professional",
  "AI for Real Estate Manager",
  "AI for Real Estate Expert",
];
export const times = [
  "Morning (9 AM – 12 PM)",
  "Afternoon (12 PM – 4 PM)",
  "Evening (4 PM – 8 PM)",
];
export const enquirySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    countryCode: z.string().trim().max(8).optional(),
    phone: z.string().trim().min(1).max(32),
    email: z
      .string()
      .trim()
      .max(254)
      .regex(/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/)
      .transform((v) => v.toLowerCase()),
    pathway: z.string().optional(),
    track: z.string().optional(),
    preferredTime: z.enum(times).optional(),
    source: z.enum(["lead-popup", "show-interest-form"]),
    website: z.string().optional(),
  })
  .transform((v) => ({ ...v, pathway: v.track || v.pathway }))
  .pipe(
    z.object({
      name: z.string(),
      countryCode: z.string().optional(),
      phone: z.string(),
      email: z.string(),
      pathway: z.enum(pathways),
      preferredTime: z.enum(times).optional(),
      source: z.enum(["lead-popup", "show-interest-form"]),
      website: z.string().optional(),
    }),
  )
  .refine((v) => v.source !== "lead-popup" || !!v.countryCode, {
    message: "countryCode is required",
    path: ["countryCode"],
  })
  .refine((v) => v.source !== "lead-popup" || !!v.preferredTime, {
    message: "preferredTime is required",
    path: ["preferredTime"],
  });
