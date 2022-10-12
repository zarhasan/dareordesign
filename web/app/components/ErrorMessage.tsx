import { ReactElement } from 'react';

export default function ErrorMessage({
  message,
}: {
  message: string | ReactElement;
}) {
  return <>{message && <p className="note note--error mb-2">{message}</p>}</>;
}
