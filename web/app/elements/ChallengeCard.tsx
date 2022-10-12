import { ChallengeObjectFull } from '~/schema/Challenge.server';
import { ENV } from '~/utils/global';
import slugify from '~/utils/slugify';

import AspectRatio from '@mui/joy/AspectRatio';
import { Link } from '@remix-run/react';

export default function ChallengeCard({
  challenge,
}: {
  challenge: ChallengeObjectFull;
}) {
  return (
    <li className="relative rounded-lg border-1 border-gray-200 p-3">
      <Link to={`/challenge/${slugify(challenge.name)}-${challenge._id}`}>
        <AspectRatio ratio="1/1">
          <img
            className="h-auto w-full rounded-md object-cover object-top"
            src={`${ENV.S3_BUCKET_PUBLIC_URL}/${challenge.images[0].key}`}
          />
        </AspectRatio>
      </Link>
      <div className="px-2">
        <h2 className="mt-3 text-sm font-bold">{challenge.name}</h2>
        <div className="mt-2 flex items-center justify-start gap-2 text-xs">
          <img
            src={challenge.user.profile.picture}
            className="h-6 w-6 rounded-full object-cover"
          />
          <p>{challenge.user.name}</p>
        </div>
      </div>
    </li>
  );
}
