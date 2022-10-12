import React, { SyntheticEvent, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import EmptyState from '~/components/EmptyState';
import { findUserChallenges } from '~/queries/challenge.server';
import { ChallengeObjectFull } from '~/schema/Challenge.server';
import { UserObject } from '~/schema/User.server';
import { authenticator } from '~/services/auth.server';
import { ENV } from '~/utils/global';
import slugify from '~/utils/slugify';

import { Menu, MenuItem } from '@mui/joy';
import { json, LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { IconDotsVertical, IconPlus } from '@tabler/icons';

export const loader: LoaderFunction = async ({ request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const challenges = findUserChallenges({ user_id: user._id });

  return json({ challenges: await challenges, user: user });
};

export default function Challenges() {
  const data = useLoaderData();

  return (
    <>
      <div className="flex items-center justify-start">
        <h1 className="text-5xl font-bold">Posts</h1>

        <Link
          type="submit"
          to="create"
          className="btn btn--primary ml-auto w-auto self-start"
        >
          <IconPlus className="mr-2 h-auto w-5" />
          Post A New Challenge
        </Link>
      </div>

      <div className="mt-10 ">
        {!data?.challenges || data?.challenges?.length < 1 ? (
          <EmptyState
            title="No Posts Found"
            description="You have not posted any challenge yet."
            cta={
              <Link type="submit" to="create" className="btn btn--primary mt-4">
                <IconPlus className="mr-2 h-auto w-5" />
                Post A New Challenge
              </Link>
            }
          />
        ) : (
          <List challenges={data?.challenges} user={data?.user} />
        )}
      </div>
    </>
  );
}

function List({
  challenges,
  user,
}: {
  challenges: ChallengeObjectFull[];
  user: UserObject;
}) {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 3 }}>
      <Masonry gutter="1.5rem">
        {challenges.map((challenge, index) => {
          return <Card key={index} challenge={challenge} user={user} />;
        })}
      </Masonry>
    </ResponsiveMasonry>
  );
}

export function Card({
  challenge,
  user,
}: {
  challenge: ChallengeObjectFull;
  user: UserObject;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="relative rounded-lg border-1 border-gray-200 p-3">
      <div className="mb-3 px-2">
        <div className="flex items-center justify-start">
          <h2 className="text-sm font-semibold">{challenge.name}</h2>

          <button
            id="basic-demo-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={(event: SyntheticEvent) => {
              setAnchorEl(event.currentTarget);
            }}
            className="icon-button icon-button--sm ml-auto"
          >
            <IconDotsVertical />
          </button>
        </div>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          aria-labelledby="basic-demo-button"
        >
          <MenuItem>
            <Link to={`delete/${challenge._id}`}>Delete</Link>
          </MenuItem>
          <MenuItem>
            <Link to={`edit/${challenge._id}`}>Edit</Link>
          </MenuItem>
        </Menu>
      </div>

      <Link to={`/challenge/${slugify(challenge.name)}-${challenge._id}`}>
        <img
          className="h-auto w-full rounded-md object-cover object-top"
          src={`${ENV.S3_BUCKET_PUBLIC_URL}/${challenge.images[0].key}`}
        />
      </Link>

      <div className="mt-3 flex items-center justify-start gap-2 text-sm">
        <img
          src={user.profile.picture}
          className="h-6 w-6 rounded-full object-cover"
        />
        <p>{user.name}</p>
      </div>
    </div>
  );
}
