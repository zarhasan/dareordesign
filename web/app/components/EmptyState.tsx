import clsx from 'clsx';
import { ReactElement } from 'react';

import { IconHourglassEmpty } from '@tabler/icons';

export default function EmptyState({
  title = null,
  description = null,
  cta,
  classes,
}: {
  title?: string | null;
  description?: string | null;
  cta?: ReactElement;
  classes?: any;
}) {
  return (
    <div
      className={clsx([
        "flex flex-col items-center justify-center rounded-md border-1 border-dashed border-gray-300 p-10 text-center",
        classes?.wrapper,
      ])}
    >
      {<IconHourglassEmpty className="mb-4 h-auto w-6 text-gray-500" />}
      {title && (
        <h2
          className={clsx([
            "text-md font-semibold text-gray-500",
            classes?.heading,
          ])}
        >
          {title}
        </h2>
      )}
      {description && <p className="mt-2 text-gray-500">{description}</p>}
      {cta}
    </div>
  );
}
