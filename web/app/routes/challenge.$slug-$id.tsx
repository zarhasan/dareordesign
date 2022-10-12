import clsx from 'clsx';
import createDOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { parseForm, useZorm } from 'react-zorm';
import { ClientOnly } from 'remix-utils';
import { disconnect, setup } from 'twind/shim';
import { ZodError } from 'zod';
import EmptyState from '~/components/EmptyState';
import Image from '~/components/Image';
import useTabs from '~/hooks/useTabs';
import { findChallenge } from '~/queries/challenge.server';
import {
    findChallengeSubmissions, findUserChallengeSubmission, insertSubmission
} from '~/queries/submission.server';
import { ChallengeObjectFull } from '~/schema/Challenge.server';
import { S3Object } from '~/schema/S3Object';
import { SubmissionSchema } from '~/schema/Submission';
import {
    SubmissionObject, SubmissionObjectFull, SubmissionServerSchema
} from '~/schema/Submission.server';
import { UserObject } from '~/schema/User.server';
import { authenticator } from '~/services/auth.server';
import { ENV, twindConfig } from '~/utils/global';
import objectify from '~/utils/objectify';

import { html } from '@codemirror/lang-html';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import {
    Form, Link, useActionData, useFetcher, useLoaderData, useTransition
} from '@remix-run/react';
import {
    IconCopy, IconExternalLink, IconEye, IconPencil, IconPlus, IconSourceCode, IconThumbDown,
    IconThumbUp
} from '@tabler/icons';
import CodeMirror from '@uiw/react-codemirror';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user: any = await authenticator.isAuthenticated(request);
  const challenge = await findChallenge({ id: params?.id });
  const submissions = await findChallengeSubmissions({ id: params?.id });

  let userSubmission = null;

  if (user) {
    userSubmission = await findUserChallengeSubmission({
      user_id: `${user._id}`,
      challenge_id: params?.id,
    });
  }

  return json({
    challenge: challenge[0],
    user: user,
    submissions: submissions,
    userSubmission: userSubmission,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const user: any = await authenticator.isAuthenticated(request);

  try {
    const data = parseForm(SubmissionSchema, form);

    const completeData = {
      ...data,
      user: {
        _id: objectify(user?._id),
      },
      challenge: {
        _id: objectify(params.id),
      },
      votes: {
        up: 0,
        down: 0,
      },
    };

    const safeData = SubmissionServerSchema.parse(completeData);

    await insertSubmission({ data: safeData });
  } catch (error) {
    if (error instanceof ZodError) {
      return json({ ok: false, serverIssues: error.issues }, { status: 400 });
    }
  }

  return json({ ok: true });
};

export default function Index() {
  // @ts-ignore
  const data: {
    challenge: ChallengeObjectFull;
    user: UserObject;
    submissions: SubmissionObjectFull[];
    userSubmission: SubmissionObject;
  } = useLoaderData();

  useEffect(() => {
    setup(twindConfig);
  }, []);

  return (
    <div className="container my-10 flex flex-wrap items-start justify-start gap-10">
      <div className="w-full overflow-hidden rounded-lg border-1 border-gray-200 lg:w-3/4">
        <div className="px-8 py-6">
          <h1 className="text-xl font-bold">{data.challenge.name}</h1>
          <p className="mt-2">{data.challenge.description}</p>
        </div>

        <Images images={data.challenge.images} />

        {data?.challenge?.links && data?.challenge?.links?.length > 0 && (
          <ul className="py-6 px-8">
            {data.challenge.links.map((link) => {
              return (
                <li>
                  <a
                    className="btn btn--neutral btn--sm text-sm"
                    target="_blank"
                    href={link.value}
                  >
                    {link.name}

                    <IconExternalLink className="ml-2 h-auto w-3" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex w-full grow flex-col items-start justify-start lg:w-1/5">
        <div className="flex grow flex-col items-center justify-center rounded-lg border-1 border-gray-200 p-10 text-center">
          <Image
            referrerPolicy="no-referrer"
            className="h-20 w-20 overflow-hidden rounded-full object-cover object-center"
            src={data.challenge.user.profile.picture}
          />

          <div className="mt-4 text-sm">
            <h2 className="font-bold">{data.challenge.user.name}</h2>
            <a
              href={`mailto:${data.challenge.user.email}`}
              className="mt-2 inline-flex text-gray-600 hover:underline"
            >
              {data.challenge.user.email}
            </a>
          </div>
        </div>

        {data?.challenge?.tags && data.challenge.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap items-center justify-start gap-2">
            {data.challenge.tags.map((tag, index) => {
              return (
                <li key={index}>
                  <Link
                    className="btn btn--white btn--md text-xs"
                    to={`/?tags=${tag.slug}`}
                  >
                    {tag.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="w-full lg:w-3/4">
        <SubmissionForm user={data.user} submission={data.userSubmission} />

        {data?.submissions?.length > 0 && (
          <ul className="mt-4 flex w-full flex-col items-start justify-start gap-4">
            {data.submissions.map((submission) => {
              return (
                <Submission
                  key={`${submission._id}`}
                  submission={submission}
                  user={data.user}
                />
              );
            })}
          </ul>
        )}

        {!data.user && data?.submissions?.length <= 0 && (
          <EmptyState
            title="No Submission Found"
            description="Complete this challenge."
            cta={
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link to="/login" className="btn btn--primary">
                  Login To Post Your Solution
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

const Images = ({ images }: { images: S3Object[] }) => {
  if (!images) {
    return null;
  }

  if (images?.length < 1) {
    return null;
  }

  const tabs = useTabs();

  return (
    <div className="">
      <div ref={tabs.panelsRef} className="overflow-hidden">
        <ul className="flex h-full w-full">
          {images.map((image: any, index: number) => {
            return (
              <li
                key={index}
                className="relative h-full shrink-0 grow-0 basis-full"
              >
                <Image
                  src={`${ENV.S3_BUCKET_PUBLIC_URL}/${image.key}`}
                  className="flex h-full w-full items-center justify-center"
                />
              </li>
            );
          })}
        </ul>
      </div>

      {images?.length > 1 && (
        <div className="overflow-hidden p-4" ref={tabs.tabsRef}>
          <ul className="flex h-20 gap-1">
            {images.map((image: any, index: number) => {
              return (
                <li
                  key={index}
                  className={clsx(
                    "relative h-full shrink-0 grow-0 basis-20 overflow-hidden rounded-sm border-1",
                    [
                      index === tabs.selectedIndex
                        ? "border-gray-300"
                        : "border-transparent",
                    ]
                  )}
                  onClick={() => tabs.onTabClick(index)}
                >
                  <Image
                    src={`${ENV.S3_BUCKET_PUBLIC_URL}/${image.key}`}
                    className="flex h-full w-full items-center justify-center"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

function Submission({
  submission,
  user,
}: {
  submission: SubmissionObjectFull;
  user: UserObject;
}) {
  const DOMPurify =
    typeof window !== "undefined" ? createDOMPurify(window) : false;

  if (!DOMPurify) {
    return null;
  }

  const [contentState, setContentState] = useState("result");
  const sourceRef = useRef(null);

  const voter = useFetcher();

  return (
    <ClientOnly fallback={<></>}>
      {() => {
        return (
          <li className="w-full rounded-lg border-1 border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-start gap-2">
              <Image
                referrerPolicy="no-referrer"
                alt={`${submission.user.name}`}
                src={submission.user.profile.picture}
                className="h-8 w-8 overflow-hidden rounded-full object-cover object-center"
              />
              <p className="text-xs font-semibold">{submission.user.name}</p>
            </div>

            <div className="mt-8 mb-8 flex items-center justify-start gap-3">
              {contentState === "source" && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<IconEye />}
                  onClick={() => setContentState("result")}
                >
                  View Result
                </Button>
              )}
              {contentState === "result" && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<IconSourceCode />}
                  onClick={() => setContentState("source")}
                >
                  View Source
                </Button>
              )}

              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator={<IconCopy />}
                onClick={() => {
                  navigator.clipboard.writeText(submission.body).then(
                    () => {
                      toast.success("Successfully copied to clipboard");
                    },
                    (err) => {
                      toast.error("Could not copy");
                    }
                  );
                }}
              >
                Copy Source
              </Button>
            </div>

            {DOMPurify && contentState === "result" && (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(submission.body),
                }}
              />
            )}

            {contentState === "source" && (
              <div className="prose max-w-full" ref={sourceRef}>
                <pre>
                  <code>{submission.body}</code>
                </pre>
              </div>
            )}

            <div className="mt-8 flex items-center justify-start gap-3">
              <voter.Form
                method="post"
                action={`/api/challenge/vote/${submission._id}`}
              >
                <input type="hidden" name="entity[type]" value="submission" />
                <input type="hidden" name="type" value="1" />
                <Button
                  type="submit"
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  disabled={
                    voter.state === "loading" || voter.state === "submitting"
                  }
                  startDecorator={<IconThumbUp />}
                >
                  Upvote ({submission.votes?.up || 0})
                </Button>
              </voter.Form>
              <voter.Form
                method="post"
                action={`/api/challenge/vote/${submission._id}`}
              >
                <input type="hidden" name="entity[type]" value="submission" />
                <input type="hidden" name="type" value="-1" />
                <Button
                  type="submit"
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<IconThumbDown />}
                  disabled={
                    voter.state === "loading" || voter.state === "submitting"
                  }
                >
                  Downvote ({submission.votes?.down || 0})
                </Button>
              </voter.Form>
            </div>
          </li>
        );
      }}
    </ClientOnly>
  );
}

function SubmissionForm({
  user,
  submission,
}: {
  user: UserObject;
  submission: SubmissionObject;
}) {
  if (!user) {
    return null;
  }

  const previewRef = useRef();
  const transition = useTransition();
  const response = useActionData();
  const zorm = useZorm("submission.create", SubmissionSchema, {
    customIssues: response?.serverIssues,
  });

  const [contentState, setContentState] = useState("edit");
  const [body, setBody] = useState(submission ? submission.body : "");

  const disabled =
    transition.state === "loading" || transition.state === "submitting";

  const DOMPurify =
    typeof window !== "undefined" ? createDOMPurify(window) : false;

  useEffect(() => {
    if (
      transition.state != "submitting" &&
      transition.type === "actionReload"
    ) {
      zorm.refObject.current?.reset();
    }
  }, [transition.state]);

  return (
    <Form
      method="post"
      action="."
      className="flex flex-col items-stretch justify-start gap-4 rounded-lg border-1 border-gray-200 p-4"
      ref={zorm.ref}
    >
      <div className="flex items-center justify-start gap-2">
        <Image
          referrerPolicy="no-referrer"
          alt={`${user.name}`}
          src={user.profile.picture}
          className="h-8 w-8 overflow-hidden rounded-full object-cover object-center"
        />
        <p className="text-xs font-semibold">{user.name}</p>
      </div>

      <FormControl error={zorm.errors.body() !== undefined}>
        <FormLabel sx={{ width: "100%" }}>
          Submission Body
          {contentState === "edit" && (
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              sx={{ marginLeft: "auto" }}
              startDecorator={<IconEye />}
              onClick={() => {
                setContentState("preview");
                setup(twindConfig);
              }}
            >
              Preview
            </Button>
          )}
          {contentState === "preview" && (
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              sx={{ marginLeft: "auto" }}
              startDecorator={<IconPencil />}
              onClick={() => {
                setContentState("edit");
                disconnect();
              }}
            >
              Edit
            </Button>
          )}
        </FormLabel>
        {contentState === "edit" && (
          <>
            {zorm.fields.body((props: { name: string; id: string }) => (
              <input
                type="hidden"
                name={props.name}
                id={props.id}
                defaultValue={body}
              />
            ))}

            <CodeMirror
              value={body}
              height="20rem"
              extensions={[html()]}
              onChange={(value) => setBody(value)}
            />

            {zorm.errors.body((e) => (
              <FormHelperText>{e.message}</FormHelperText>
            ))}
          </>
        )}
      </FormControl>

      {typeof window !== "undefined" &&
        contentState === "preview" &&
        DOMPurify && (
          <div
            className="twind-preview"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(body),
            }}
          />
        )}

      {contentState === "edit" && (
        <button
          type="submit"
          disabled={disabled}
          className="btn btn--primary w-auto self-start"
        >
          Submit
        </button>
      )}
    </Form>
  );
}
