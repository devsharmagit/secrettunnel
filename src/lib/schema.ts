import * as z from "zod";


export const CreateSecretSchema = z.object({
    ciphertext: z.string(),
     iv: z.string(), 
    ttl: z.coerce.number().int().positive(),
      passwordHash: z.string().optional()
}).strict()

export type CreateSecretSchemaType = z.infer<typeof CreateSecretSchema>;


