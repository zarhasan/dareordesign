import type { ActionArgs } from "@remix-run/node";
import { authenticator } from '~/services/auth.server';

import { redirect } from '@remix-run/node';

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  return authenticator.authenticate("github", request);
}
