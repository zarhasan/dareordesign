import { z } from 'zod';
import { TagSchema } from '~/schema/partials/Tag';
import { S3ObjectSchema } from '~/schema/S3Object';

export const ChallengeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(2000),
  images: z.array(S3ObjectSchema).min(1).max(12),
  assets: z.array(S3ObjectSchema).max(1).optional(),
  tags: z
    .array(TagSchema, { required_error: "Add at least 1 Tag" })
    .min(1, { message: "Add at least 1 tag" })
    .max(10),
});
