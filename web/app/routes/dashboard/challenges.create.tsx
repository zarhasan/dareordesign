import { useList } from 'react-use';
import { parseForm, useZorm } from 'react-zorm';
import { ZodError } from 'zod';
import ErrorMessage from '~/components/ErrorMessage';
import InputMedia from '~/components/InputMedia';
import { insertChallenge } from '~/queries/challenge.server';
import { ChallengeSchema } from '~/schema/Challenge';
import { ChallengeObject, ChallengeServerSchema } from '~/schema/Challenge.server';
import { LinkObject } from '~/schema/partials/Link';
import { TagObject } from '~/schema/partials/Tag,server';
import { authenticator } from '~/services/auth.server';
import slugify from '~/utils/slugify';

import { Divider, Input } from '@mui/joy';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import TextField from '@mui/joy/TextField';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { IconMinus, IconPlus } from '@tabler/icons';

export const loader: LoaderFunction = async ({ request }) => {
  const user: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ user: user });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const user: any = await authenticator.isAuthenticated(request);

  try {
    const data = parseForm(ChallengeSchema, form);

    const completeData = {
      ...data,
      tags: data.tags.map((tag) => {
        return {
          name: tag.name,
          slug: slugify(tag.name),
        };
      }),
      user: {
        _id: user?._id,
      },
    };

    const safeData = ChallengeServerSchema.parse(completeData);

    await insertChallenge({ data: safeData });

    return redirect("/dashboard/challenges");
  } catch (error) {
    if (error instanceof ZodError) {
      return json({ ok: false, serverIssues: error.issues }, { status: 400 });
    }
  }

  return json({ ok: true });
};

export default function Create() {
  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">Post A Challenge</h1>

      <ChallengeForm action="." />
    </>
  );
}

export function ChallengeForm({
  action,
  defaultValues,
}: {
  action: string;
  defaultValues?: ChallengeObject;
}) {
  const response = useActionData();
  const transition = useTransition();
  const zorm = useZorm("challenge.create", ChallengeSchema, {
    customIssues: response?.serverIssues,
  });

  const disabled =
    transition.state === "loading" || transition.state === "submitting";

  const [tagsList, tags] = useList<Omit<TagObject, "slug">>(
    defaultValues?.tags || [
      {
        name: "",
      },
    ]
  );

  const [linksList, links] = useList<LinkObject>(
    defaultValues?.links || [
      {
        name: "",
        value: "https://",
      },
    ]
  );

  return (
    <Form
      method="post"
      action={action}
      className="flex flex-col items-stretch justify-start gap-4"
      ref={zorm.ref}
    >
      <FormLabel>Images</FormLabel>

      <InputMedia defaultValue={defaultValues?.images || []} />

      {zorm.errors.images((e) => (
        <ErrorMessage message={e.message} />
      ))}

      <TextField
        label="Name"
        type="text"
        name={zorm.fields.name()}
        placeholder="Enter Challenge Name"
        error={zorm.errors.name() !== undefined}
        helperText={zorm.errors.name((e) => e.message)}
        defaultValue={defaultValues?.name}
      />

      <FormControl error={zorm.errors.description() !== undefined}>
        <FormLabel>Description</FormLabel>
        <Textarea
          name={zorm.fields.description()}
          placeholder="Enter Challenge Description"
          minRows={3}
          defaultValue={defaultValues?.description}
        />

        {zorm.errors.description((e) => (
          <FormHelperText>{e.message}</FormHelperText>
        ))}
      </FormControl>

      <Divider>Tags</Divider>

      {tagsList.map((tag, index) => {
        return (
          <FormControl error={zorm.errors.tags(index).name() !== undefined}>
            <div className="flex items-center justify-start gap-4">
              {zorm.fields
                .tags(index)
                .name((props: { name: string; id: string }) => (
                  <Input
                    placeholder="Enter A Tag"
                    name={props.name}
                    id={props.id}
                    defaultValue={tagsList[index].name}
                    sx={{ flexGrow: 1 }}
                  />
                ))}

              <Button
                variant="outlined"
                color="neutral"
                onClick={() => tags.removeAt(index)}
              >
                <IconMinus />
              </Button>
            </div>
            {zorm.errors.tags(index).name((e) => (
              <FormHelperText>{e.message}</FormHelperText>
            ))}
          </FormControl>
        );
      })}

      {zorm.errors.tags((e) => (
        <ErrorMessage message={e.message} />
      ))}

      {tagsList.length < 10 && (
        <div className="flex items-center justify-end">
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<IconPlus />}
            onClick={() =>
              tags.push({
                name: "",
              })
            }
          >
            Add Tag
          </Button>
        </div>
      )}

      <Divider>Links</Divider>

      {linksList.map((link, index) => {
        return (
          <FormControl
            error={
              zorm.errors.links(index).name() !== undefined ||
              zorm.errors.links(index).value() !== undefined
            }
          >
            <div className="flex items-center justify-start gap-4">
              <div className="grow">
                {zorm.fields
                  .links(index)
                  .name((props: { name: string; id: string }) => (
                    <Input
                      placeholder="Enter A Link Name"
                      name={props.name}
                      id={props.id}
                      defaultValue={linksList[index].name}
                      sx={{ flexGrow: 1 }}
                    />
                  ))}

                {zorm.errors.links(index).name((e) => (
                  <FormHelperText>{e.message}</FormHelperText>
                ))}
              </div>

              <div className="grow">
                {zorm.fields
                  .links(index)
                  .value((props: { name: string; id: string }) => (
                    <Input
                      placeholder="Enter A Link Value"
                      name={props.name}
                      id={props.id}
                      defaultValue={linksList[index].value}
                      sx={{ flexGrow: 1 }}
                    />
                  ))}

                {zorm.errors.links(index).value((e) => (
                  <FormHelperText>{e.message}</FormHelperText>
                ))}
              </div>

              <Button
                variant="outlined"
                color="neutral"
                onClick={() => links.removeAt(index)}
              >
                <IconMinus />
              </Button>
            </div>
          </FormControl>
        );
      })}

      {zorm.errors.links((e) => (
        <ErrorMessage message={e.message} />
      ))}

      {linksList.length < 10 && (
        <div className="flex items-center justify-end">
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<IconPlus />}
            onClick={() =>
              links.push({
                name: "",
                value: "https://",
              })
            }
          >
            Add Link
          </Button>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="btn btn--primary mt-4 w-auto self-start"
      >
        Post The Challenge
      </button>
    </Form>
  );
}
