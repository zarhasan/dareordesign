import { authenticator } from '~/services/auth.server';

import { LoaderFunction } from '@remix-run/node';

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
