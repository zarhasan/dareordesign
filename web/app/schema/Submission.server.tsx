import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ObjectID } from '~/schema/partials/ObjectID.server';
import { SubmissionSchema } from '~/schema/Submission';

import { ChallengeObjectFull } from './Challenge.server';
import { UserObject } from './User.server';

export const SubmissionServerSchema = SubmissionSchema.extend({
  challenge: z.object({
    _id: ObjectID,
  }),
  user: z.object({
    _id: ObjectID,
  }),
  votes: z.object({
    up: z.number().nonnegative(),
    down: z.number().nonnegative(),
  }),
});

export type SubmissionObject = z.infer<typeof SubmissionServerSchema>;
// @ts-ignore
export interface SubmissionObjectFull extends SubmissionObject {
  _id: ObjectId;
  challenge: ChallengeObjectFull;
  user: UserObject;
  votes: {
    up: number;
    down: number;
  };
}
