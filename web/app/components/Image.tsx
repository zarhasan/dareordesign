import { useBoolean, useInViewport } from 'ahooks';
import clsx from 'clsx';
import { useRef } from 'react';

import { IconPhoto } from '@tabler/icons';

export default function Image({
  src,
  width = 0,
  height = 0,
  alt = "",
  className = "",
  referrerPolicy,
  ...props
}: {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  referrerPolicy?: string;
}) {
  const imageRef = useRef(null);
  const [inViewport, ratio] = useInViewport(imageRef, {
    threshold: 0.15,
    rootMargin: "100px",
  });
  const [isLoaded, loaded] = useBoolean();
  const [isError, err] = useBoolean();

  return (
    <div className={clsx(className, ["bg-gray-100"])} ref={imageRef}>
      {isError ? (
        <div className="flex h-full w-full items-center justify-center text-center">
          <IconPhoto className="h-auto w-1/2 text-gray-500" />
        </div>
      ) : (
        <img
          src={inViewport ? src : isLoaded ? src : undefined}
          alt={alt}
          height={height}
          width={width}
          className={clsx("h-full w-full object-cover object-top", [
            isLoaded ? "opacity-100" : "opacity-0",
          ])}
          onLoad={() => loaded.setTrue()}
          onError={() => err.setTrue()}
          {...props}
        />
      )}
    </div>
  );
}
