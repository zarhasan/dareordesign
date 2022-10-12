import { ObjectId } from 'mongodb';

export default (id: unknown): ObjectId | any => {
  if (typeof id === "string") {
    return new ObjectId(id);
  }

  return id;
};
