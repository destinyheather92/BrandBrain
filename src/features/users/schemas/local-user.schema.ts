import { z } from "zod";

export const clerkEmailAddressSchema = z.object({
  emailAddress: z.string().email()
});

export const clerkUserSyncPayloadSchema = z.object({
  emailAddresses: z.array(clerkEmailAddressSchema),
  firstName: z.string().nullable().optional(),
  id: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
  lastName: z.string().nullable().optional(),
  unsafeMetadata: z
    .object({
      brandbrainProfile: z
        .object({
          firstName: z.string().nullable().optional(),
          lastName: z.string().nullable().optional()
        })
        .optional()
    })
    .passthrough()
    .nullable()
    .optional(),
  username: z.string().nullable().optional()
});

export const localUserSchema = z.object({
  clerkUserId: z.string().min(1),
  createdAt: z.date(),
  email: z.string().email().nullable(),
  firstName: z.string().min(1).nullable(),
  id: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  lastName: z.string().min(1).nullable(),
  name: z.string().min(1).nullable(),
  updatedAt: z.date()
});

export const localUserUpsertInputSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email().nullable(),
  firstName: z.string().min(1).nullable(),
  imageUrl: z.string().url().nullable(),
  lastName: z.string().min(1).nullable(),
  name: z.string().min(1).nullable()
});
