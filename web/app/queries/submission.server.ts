import { database } from '~/libs/mongo.server';
import { SubmissionObject } from '~/schema/Submission.server';
import objectify from '~/utils/objectify';

const prefix = "submissions_";
const collection = database.collection("submissions");

export async function insertSubmission({ data }: { data: SubmissionObject }) {
  return collection.findOneAndUpdate(
    { "user._id": data.user._id, "challenge._id": data.challenge._id },
    { $set: data },
    { upsert: true, returnDocument: "after" }
  );
}

export async function findChallengeSubmissions({
  id,
}: {
  id: string | undefined | null;
}) {
  if (!id) {
    return [];
  }

  return collection
    .aggregate([
      {
        $match: {
          "challenge._id": objectify(id),
        },
      },
      {
        $sort: {
          "votes.up": -1,
          "votes.down": 1,
          _id: -1,
        },
      },
      {
        $limit: 50,
      },
      {
        $lookup: {
          from: "users",
          localField: "user._id",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                name: 1,
                "profile.picture": 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
    ])
    .toArray();
}

export async function findUserChallengeSubmission({
  user_id,
  challenge_id,
}: {
  user_id: string | undefined | null;
  challenge_id: string | undefined | null;
}) {
  if (!user_id) {
    return [];
  }

  return collection.findOne({
    "user._id": objectify(user_id),
    "challenge._id": objectify(challenge_id),
  });
}

export async function countUserSubmissions({
  user_id,
}: {
  user_id: string | null | undefined;
}) {
  return collection.find({ "user._id": objectify(user_id) }).count();
}

export async function findUserSubmissions({ user_id }: { user_id: string }) {
  return collection
    .aggregate([
      {
        $match: {
          "user._id": objectify(user_id),
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $lookup: {
          from: "challenges",
          localField: "challenge._id",
          foreignField: "_id",
          as: "challenge",
        },
      },
      {
        $unwind: {
          path: "$challenge",
        },
      },
    ])
    .toArray();
}
