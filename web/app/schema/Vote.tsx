import { z } from 'zod';

export const VoteEntityTypes = ["submission", "challenge", "user"] as const;

export const VoteSchema = z.object({
  entity: z.object({
    type: z.enum(VoteEntityTypes),
  }),
  type: z.preprocess((value: unknown) => {
    return typeof value === "string" ? parseInt(value) : value;
  }, z.literal(1).or(z.literal(-1))),
});

export const VoteEntityTypesToCollection = (type: string) => {
  const collections: any = {
    submission: "submissions",
    challenge: "challenges",
    user: "users",
  };

  return collections[type];
};
