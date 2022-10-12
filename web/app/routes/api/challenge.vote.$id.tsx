import { parseForm } from 'react-zorm';
import { ZodError } from 'zod';
import { insertVote } from '~/queries/vote.server';
import { VoteSchema } from '~/schema/Vote';
import { VoteServerSchema } from '~/schema/Vote.server';
import { authenticator } from '~/services/auth.server';

import { ActionFunction, json } from '@remix-run/node';

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();

  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  try {
    const data = parseForm(VoteSchema, formData);

    const completeData = {
      entity: {
        type: data.entity.type,
        _id: params?.id,
      },
      type: data.type,
      user: {
        _id: user?._id,
      },
    };

    const safeData = VoteServerSchema.parse(completeData);

    await insertVote({ data: safeData });
  } catch (error) {
    if (error instanceof ZodError) {
      return json({ ok: false, serverIssues: error.issues }, { status: 400 });
    }
  }

  return json({ ok: true });
};
