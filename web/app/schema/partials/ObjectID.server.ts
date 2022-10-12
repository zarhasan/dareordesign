import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const ObjectID = z.preprocess((value: unknown) => {
  if (typeof value != "string") {
    return value;
  }

  return new ObjectId(value);
}, z.instanceof(ObjectId));
