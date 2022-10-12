import { parseForm } from 'react-zorm';
import { ZodError } from 'zod';
import { findUserChallenge, updateChallenge } from '~/queries/challenge.server';
import { ChallengeForm } from '~/routes/dashboard/challenges.create';
import { ChallengeSchema } from '~/schema/Challenge';
import { ChallengeObject, ChallengeServerSchema } from '~/schema/Challenge.server';
import { authenticator } from '~/services/auth.server';
import slugify from '~/utils/slugify';

import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const challenge = await findUserChallenge({
    id: params?.id,
    user_id: user?._id,
  });

  return json({ challenge: challenge });
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const user: any = await authenticator.isAuthenticated(request);

  try {
    const data = parseForm(ChallengeSchema, form);

    const completeData = {
      ...data,
      tags: data.tags.map((tag) => {
        return {
          name: tag.name,
          slug: slugify(tag.name),
        };
      }),
      user: {
        _id: user?._id,
      },
    };

    const safeData = ChallengeServerSchema.parse(completeData);

    await updateChallenge({ data: safeData, id: params?.id });

    return redirect("/dashboard/challenges");
  } catch (error) {
    if (error instanceof ZodError) {
      return json({ ok: false, serverIssues: error.issues }, { status: 400 });
    }
  }

  return json({ ok: true });
};

export default function Update() {
  // @ts-ignore
  const data: { challenge: ChallengeObject } = useLoaderData();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">Post A Challenge</h1>

      <ChallengeForm action="." defaultValues={data.challenge} />
    </>
  );
}
