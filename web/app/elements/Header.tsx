import React, { ReactElement, SyntheticEvent } from 'react';
import { UserObject } from '~/schema/User.server';

import Button from '@mui/joy/Button';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import { Form, Link, useTransition } from '@remix-run/react';

export default function Header({ user }: { user: UserObject }) {
  const transition = useTransition();
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="relative flex h-20 items-center justify-start border-b-1 border-gray-100 py-4">
      <div className="container flex items-center justify-start">
        <Link to="/" className=" text-sm font-bold">
          Dare Or Design
        </Link>

        {/* <nav className="pl-8">
          <ul className="flex items-center justify-center gap-4 text-sm font-semibold">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/challenges">Challenges</Link>
            </li>
          </ul>
        </nav> */}

        {user ? (
          <>
            <button
              id="basic-demo-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={(event: SyntheticEvent) => {
                setAnchorEl(event.currentTarget);
              }}
              className="ml-auto"
            >
              <img
                src={user.profile.picture}
                referrerPolicy="no-referrer"
                className="mr-2 h-10 w-10 rounded-full"
              />
            </button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              aria-labelledby="basic-demo-button"
            >
              <MenuItem onClick={handleClose}>
                <Link className="w-full" to="/dashboard/challenges">
                  Posts
                </Link>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <Link className="w-full" to="/dashboard/submissions">
                  Submissions
                </Link>
              </MenuItem>
              {/* <MenuItem onClick={handleClose}>
                <Link className="w-full" to="/dashboard/settings">
                  Settings
                </Link>
              </MenuItem> */}
              <MenuItem onClick={handleClose}>
                <Link className="w-full" to="/logout">
                  Logout
                </Link>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Link className="btn btn--neutral btn--md ml-auto" to="/login">
            Login
          </Link>
        )}
      </div>

      {(transition.state == "loading" || transition.state == "submitting") && (
        <div className="page__progress absolute bottom-0 left-0 right-0" />
      )}
    </div>
  );
}
