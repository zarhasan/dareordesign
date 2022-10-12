import isMongoId from 'validator/lib/isMongoId';
import { z } from 'zod';

export const ObjectID = z.string().refine(isMongoId, {
  message: "Value is not a valid mongodb ObjectId",
});
