import { authenticator } from '~/services/auth.server';

import { ActionArgs, redirect } from '@remix-run/node';

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  return authenticator.authenticate("google", request);
}
