import isURL from 'validator/lib/isURL';
import { z } from 'zod';

export const LinkSchema = z.object({
  name: z.string().min(2).max(100),
  value: z.string().refine((value) =>
    isURL(value.trim(), {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ),
});

export type LinkObject = z.infer<typeof LinkSchema>;
