import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { authenticator } from '~/services/auth.server';

import { json, LoaderArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  return json({ ok: true });
}

export default function Index() {
  return (
    <div className="container flex items-center justify-center py-44">
      <div className="h-auto w-96 rounded-2xl border-1 border-gray-200 p-8">
        <h1 className="mb-6 text-center text-xl font-semibold">
          Login To Your Account
        </h1>
        <div className="flex flex-col items-stretch justify-start gap-4">
          <Form action="/auth/google" method="post">
            <button className="btn btn--white w-full">
              <FcGoogle className="mr-3 h-auto w-5" /> Login with Google
            </button>
          </Form>
          <Form action="/auth/github" method="post">
            <button className="btn btn--white w-full">
              <FaGithub className="mr-3 h-auto w-5" /> Login with GitHub
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
