import { z } from 'zod';

export const TagServerSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
});
