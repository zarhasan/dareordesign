import { authenticator } from '~/services/auth.server';

import { LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  await authenticator.logout(request, { redirectTo: "/login" });
}
