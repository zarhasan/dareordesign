import { deleteChallenge, findUserChallenge } from '~/queries/challenge.server';
import { ChallengeObjectFull } from '~/schema/Challenge.server';
import { authenticator } from '~/services/auth.server';

import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ params, request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const challenge = await findUserChallenge({
    id: params?.id,
    user_id: user._id,
  });

  if (!challenge) {
    return redirect("/dashboard/challenges");
  }

  return json({ challenge: challenge });
};

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  await deleteChallenge({ id: formData.get("id"), user_id: user?._id });

  return redirect("/dashboard/challenges");
};

export default function Index() {
  // @ts-ignore
  const data: { challenge: ChallengeObjectFull } = useLoaderData();

  return (
    <Form className="w-full text-left" method="post" action=".">
      <h1 className="mb-6 text-xl font-semibold">
        Are you sure you want to delete ({data.challenge.name})?
      </h1>
      <input type="hidden" name="id" value={`${data.challenge._id}`} />
      <button className="btn btn--danger text-left" type="submit">
        Delete
      </button>
    </Form>
  );
}
