import { database } from '~/libs/mongo.server';
import { VoteEntityTypesToCollection } from '~/schema/Vote';
import { VoteObject } from '~/schema/Vote.server';
import objectify from '~/utils/objectify';

const prefix = "votes_";
const collection = database.collection("votes");

export async function insertVote({ data }: { data: VoteObject }) {
  await collection.findOneAndUpdate(
    { "user._id": data.user._id, "entity._id": data.entity._id },
    { $set: data },
    { upsert: true, returnDocument: "after" }
  );

  const upvotes = collection
    .find({
      "entity._id": objectify(data.entity._id),
      "entity.type": data.entity.type,
      type: 1,
    })
    .count();

  const downvotes = collection
    .find({
      "entity._id": objectify(data.entity._id),
      "entity.type": data.entity.type,
      type: -1,
    })
    .count();

  return database
    .collection(VoteEntityTypesToCollection(data.entity.type))
    .findOneAndUpdate(
      { _id: data.entity._id },
      {
        $set: {
          votes: {
            up: await upvotes,
            down: await downvotes,
          },
        },
      },
      { returnDocument: "after" }
    );
}
