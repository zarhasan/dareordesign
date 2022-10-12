import { Link } from 'react-router-dom';
import { countUserChallenges } from '~/queries/challenge.server';
import { countUserSubmissions } from '~/queries/submission.server';
import { authenticator } from '~/services/auth.server';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export let loader = async ({ request }: { request: Request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const count = {
    challenges: await countUserChallenges({ user_id: user._id }),
    submissions: await countUserSubmissions({ user_id: user._id }),
  };

  return json({ count: count });
};

export default function Index() {
  const data = useLoaderData();

  return (
    <div>
      <h1 className="text-5xl font-bold">Dashboard</h1>

      <ul className="mt-10 flex flex-wrap items-center justify-start gap-4">
        <li>
          <Link
            to="challenges"
            className="flex flex-col rounded-lg border-1 border-gray-200 p-6"
          >
            <h2 className="text-xs font-semibold text-gray-600">
              Challenges Posted
            </h2>
            <p className="mt-2 text-3xl font-bold">
              {data?.count?.challenges || 0}
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="submissions"
            className="flex flex-col rounded-lg border-1 border-gray-200 p-6"
          >
            <h2 className="text-xs font-semibold text-gray-600">
              Challenges Completed
            </h2>
            <p className="mt-2 text-3xl font-bold">
              {data?.count?.submissions || 0}
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
