import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const UserSchema = z.object({
  provider: z.enum(["google", "github"]),
  name: z.string().min(2).max(250).nullable(),
  email: z.string().email(),
  profile: z.object({
    id: z.string().or(z.number()),
    picture: z.string(),
  }),
  visibility: z
    .enum(["PRIVATE", "PUBLIC", "BLOCKED", "ARCHIVED"])
    .default("PUBLIC"),
  updated_at: z.date().default(new Date()),
});

export type UserObject = z.infer<typeof UserSchema>;

export interface UserObjectFull extends UserObject {
  _id: ObjectId;
}
