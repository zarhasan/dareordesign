import clsx from 'clsx';
import { countUserChallenges } from '~/queries/challenge.server';
import { authenticator } from '~/services/auth.server';

import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { json } from '@remix-run/node';
import { Link, NavLink, Outlet } from '@remix-run/react';
import { IconCertificate2, IconNews } from '@tabler/icons';

export let loader = async ({ request }: { request: Request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ ok: true });
};

export default function dashboard() {
  return (
    <div className="container flex flex-wrap items-start justify-start pb-20">
      <nav className="mt-10 w-full rounded-lg border-1 border-gray-200 p-6 lg:w-1/5">
        <List aria-label="basic-list">
          <ListItem>
            <ListItemDecorator>
              <IconNews />
            </ListItemDecorator>
            <NavLink
              to="challenges"
              className={({ isActive }) => {
                return clsx("text-gray-600", {
                  "text-gray-900 underline": isActive,
                });
              }}
            >
              Posts
            </NavLink>
          </ListItem>
          <ListItem>
            <ListItemDecorator>
              <IconCertificate2 />
            </ListItemDecorator>
            <NavLink
              to="submissions"
              className={({ isActive }) => {
                return clsx("text-gray-600", {
                  "text-gray-900 underline": isActive,
                });
              }}
            >
              Submissions
            </NavLink>
          </ListItem>
        </List>
      </nav>

      <div className="w-full grow py-10 lg:min-h-screen lg:w-4/5 lg:pl-10">
        <Outlet />
      </div>
    </div>
  );
}
