import { pick } from 'lodash-es';
import EmptyState from '~/components/EmptyState';
import { findUserSubmissions } from '~/queries/submission.server';
import { SubmissionObjectFull } from '~/schema/Submission.server';
import { authenticator } from '~/services/auth.server';
import slugify from '~/utils/slugify';

import { json, LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const submissions: SubmissionObjectFull[] = await findUserSubmissions({
    user_id: user._id,
  });

  return json({
    submissions: submissions.map((submission) => {
      return {
        ...submission,
        created_at: submission._id.getTimestamp(),
      };
    }),
    user: pick(user, ["name", "profile"]),
  });
};

export default function Submissions() {
  // @ts-ignore
  const data: { submissions: SubmissionObjectFull[] } = useLoaderData();

  return (
    <>
      <div className="flex items-center justify-start">
        <h1 className="text-5xl font-bold">Submissions</h1>
      </div>

      <div className="mt-10">
        {!data?.submissions || data?.submissions?.length < 1 ? (
          <EmptyState
            title="No Submissions Found"
            description="You have not completed a challenge yet."
          />
        ) : (
          <ul className="relative border-l border-gray-200 dark:border-gray-700">
            {data.submissions.map((submission) => {
              return (
                <li className="mb-10 ml-4" key={`${submission._id}`}>
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"></div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    {/* @ts-ignore */}
                    {new Date(submission.created_at).toLocaleDateString()}
                  </time>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {submission.challenge.name}
                  </h3>
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                    {submission.challenge.description}
                  </p>
                  <Link
                    to={`/challenge/${slugify(submission.challenge.name)}-${
                      submission.challenge._id
                    }`}
                    className="btn btn--white btn--md"
                  >
                    View Challenge
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
