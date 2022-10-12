import { database } from '~/libs/mongo.server';

const prefix = "users_";
const collection = database.collection("users");

export async function getUserByEmail({ email }: { email: string }) {
  const user = await collection.findOne({
    email: email,
    visibility: {
      $in: ["PUBLIC", "PRIVATE"],
    },
  });

  if (!user) {
    return false;
  }

  return user;
}
