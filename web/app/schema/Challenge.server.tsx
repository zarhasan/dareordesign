import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ChallengeSchema } from '~/schema/Challenge';
import { ObjectID } from '~/schema/partials/ObjectID.server';

import { TagServerSchema } from './partials/Tag,server';
import { UserObject } from './User.server';

export const ChallengeServerSchema = ChallengeSchema.extend({
  user: z.object({
    _id: ObjectID,
  }),
  tags: z.array(TagServerSchema).min(1).max(10),
});

export type ChallengeObject = z.infer<typeof ChallengeServerSchema>;

// @ts-ignore
export interface ChallengeObjectFull extends ChallengeObject {
  _id: ObjectId;
  user: UserObject;
}
