import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val) return true;
      try {
        new URL(val.startsWith("http") ? val : `https://${val}`);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid website URL." }
  );

export const socialLinksSchema = z.object({
  linkedin: optionalUrlSchema,
  twitter: optionalUrlSchema,
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,
  youtube: optionalUrlSchema,
  other: optionalUrlSchema,
});

export const clientFormSchema = z.object({
  organisationName: z
    .string()
    .trim()
    .min(2, "Organisation name must be at least 2 characters.")
    .max(160, "Organisation name is too long."),
  organisationType: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().max(100).optional().or(z.literal("")),
  contactName: z
    .string()
    .trim()
    .min(2, "Contact person's name is required.")
    .max(120, "Contact name is too long."),
  contactEmail: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  website: optionalUrlSchema,
  address: z.string().trim().max(300).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  businessDescription: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  socialLinks: socialLinksSchema.optional().default({}),
  internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
