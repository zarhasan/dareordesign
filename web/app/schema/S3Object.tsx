import isURL from 'validator/lib/isURL';
import { z } from 'zod';

export const MediaContentTypes = ["image/jpeg", "image/png"] as const;
export const MediaExtensions = ["png", "jpg", "webp", "jpeg"] as const;

export const S3ObjectSchema = z.object({
  key: z.string(),
  size: z.preprocess((value: unknown) => {
    return typeof value === "string" ? parseInt(value) : value;
  }, z.number().max(1024 * 1024 * 5)),
  bucket: z.enum(["dareordesign"]),
  mimetype: z.enum(MediaContentTypes),
  location: z.string().refine(isURL),
  etag: z.string(),
});

export type S3Object = z.infer<typeof S3ObjectSchema>;
