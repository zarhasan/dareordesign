import { isEmpty } from 'lodash-es';
import { database } from '~/libs/mongo.server';
import { ChallengeObject } from '~/schema/Challenge.server';
import objectify from '~/utils/objectify';

const prefix = "challenges_";
const collection = database.collection("challenges");

export async function findUserChallenges({ user_id }: { user_id: string }) {
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
        $limit: 10,
      },
    ])
    .toArray();
}

export async function findChallenges({
  q,
  tags,
}: {
  q: string | undefined | null;
  tags: string[];
}) {
  let $match: any = {};

  const pipeline: any = [
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "users",
        localField: "user._id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
  ];

  if (tags && tags.length > 0) {
    $match["tags.slug"] = {
      $in: tags,
    };
  }

  if (!isEmpty($match) && !q) {
    pipeline.unshift({
      $match: $match,
    });
  }

  if (q) {
    pipeline.unshift({
      $search: {
        index: "default",
        text: {
          query: q,
          path: ["name", "description", "tags.name"],
          fuzzy: {
            maxEdits: 2,
          },
        },
      },
    });
  }

  return collection.aggregate(pipeline).toArray();
}

export async function findChallenge({ id }: { id: string | null | undefined }) {
  if (!id) {
    return [];
  }
  return collection
    .aggregate([
      {
        $match: {
          _id: objectify(id),
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "user._id",
          foreignField: "_id",
          as: "user",
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

export async function findUserChallenge({
  id,
  user_id,
}: {
  id: string | null | undefined;
  user_id: string | null | undefined;
}) {
  if (!id || !user_id) {
    return null;
  }

  return collection.findOne({
    _id: objectify(id),
    "user._id": objectify(user_id),
  });
}

export async function deleteChallenge({
  id,
  user_id,
}: {
  id: FormDataEntryValue | null;
  user_id: string | null | undefined;
}) {
  if (!id || !user_id) {
    return null;
  }

  return collection.deleteOne({
    _id: objectify(id),
    "user._id": objectify(user_id),
  });
}

export async function insertChallenge({ data }: { data: ChallengeObject }) {
  return collection.insertOne(data);
}

export async function updateChallenge({
  data,
  id,
}: {
  data: ChallengeObject;
  id: string | null | undefined;
}) {
  return collection.findOneAndUpdate(
    { "user._id": objectify(data.user._id), _id: objectify(id) },
    { $set: data },
    { returnDocument: "after" }
  );
}

export async function countUserChallenges({
  user_id,
}: {
  user_id: string | null | undefined;
}) {
  return collection.find({ "user._id": objectify(user_id) }).count();
}
