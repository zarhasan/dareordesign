import { z } from 'zod';

import { ObjectID } from './partials/ObjectID.server';
import { VoteEntityTypes, VoteSchema } from './Vote';

export const VoteServerSchema = VoteSchema.extend({
  entity: z.object({
    type: z.enum(VoteEntityTypes),
    _id: ObjectID,
  }),
  user: z.object({
    _id: ObjectID,
  }),
});

export type VoteObject = z.infer<typeof VoteServerSchema>;
