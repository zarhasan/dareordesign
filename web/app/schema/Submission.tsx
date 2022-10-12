import { z } from 'zod';

export const SubmissionSchema = z.object({
  body: z.string().min(10).max(10000),
});
