import * as z from "zod";


export const CreateSecretSchema = z.object({
    ciphertext: z.string(),
    iv: z.string(), 
    ttl: z.coerce.number().int().positive(),
    passwordHash: z.string().optional(),
    webhookUrl: z.string().url().optional(),
}).strict()

export type CreateSecretSchemaType = z.infer<typeof CreateSecretSchema>;


export const createSecretVersionSchema = z.object({
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
});

export const createSecretGroupSchema = z.object({
  name: z.string().trim().min(1),
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
});