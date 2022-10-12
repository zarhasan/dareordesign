import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { includes } from 'lodash-es';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDropArea } from 'react-use';
import { MediaExtensions, S3Object } from '~/schema/S3Object';
import { ENV, spring } from '~/utils/global';

import { Dialog } from '@headlessui/react';
import { useTransition } from '@remix-run/react';
import { IconPhoto, IconPhotoPlus, IconX } from '@tabler/icons';

type Previews = S3Object[];

type Props = {
  showing: boolean;
  setShowing(showing: boolean): void;
  previews: Previews;
  setPreviews(previews: Previews): void;
};

export default function InputMedia({
  defaultValue,
}: {
  defaultValue?: Previews;
}) {
  const [previews, setPreviews] = useState<Previews>(defaultValue || []);
  const [showingSelector, setShowingSelector] = useState<boolean>(false);

  const transition = useTransition();

  const disabled =
    transition.state === "loading" || transition.state === "submitting";

  return (
    <>
      <ul className="flex flex-wrap items-center justify-start gap-4">
        {previews &&
          previews?.length > 0 &&
          previews?.map((preview, index) => {
            return (
              <li key={preview.key}>
                {Object.entries(preview).map(([key, value]) => {
                  return (
                    <input
                      key={`images[${index}][${key}]`}
                      type="hidden"
                      name={`images[${index}][${key}]`}
                      value={value}
                    />
                  );
                })}

                <div className="relative">
                  <img
                    className="h-44 w-44 rounded-sm object-cover"
                    src={`${ENV.S3_BUCKET_PUBLIC_URL}/${preview.key}`}
                  />
                  <button
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 p-0.5 text-white"
                    onClick={(e) => {
                      e.preventDefault();

                      setPreviews((previews) => {
                        return previews.filter(
                          (_preview) => _preview.key != preview.key
                        );
                      });
                    }}
                  >
                    <IconX />
                  </button>
                </div>
              </li>
            );
          })}

        {previews.length < 12 && (
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowingSelector(true);
              }}
              className={clsx(
                "flex h-44 w-44 cursor-pointer items-center justify-center self-start rounded-lg border-1",
                [
                  disabled
                    ? "border-gray-500 bg-gray-50 text-gray-500 opacity-50"
                    : "border-indigo-600 bg-indigo-50 text-indigo-600 opacity-100",
                ]
              )}
            >
              <IconPhotoPlus className="h-auto w-10" />
            </button>
          </li>
        )}
      </ul>

      <Selector
        showing={showingSelector}
        setShowing={setShowingSelector}
        setPreviews={setPreviews}
      />
    </>
  );
}

function Selector({
  showing,
  setShowing,
  setPreviews,
}: Pick<Props, "showing" | "setShowing" | "setPreviews">) {
  const [disabled, setDisabled] = useState(false);
  const inputRef = useRef(null);
  const [bond, state] = useDropArea({
    onFiles: async (files) => {
      if (files.length < 1) {
        return;
      }
      await uploadFiles(files);
    },
  });

  const uploadFiles = async (files: FileList | File[]) => {
    if (files.length > 12) {
      toast.error("Please select less than 12 images");
      return;
    }

    const loadingToast = toast.loading("Uploading media...");
    setDisabled(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file, file.name);

      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const image = await response.json();

        setPreviews((previews) => {
          if (includes(previews, image)) {
            return previews;
          }

          return [...previews, image];
        });

        toast.success("Successfully uploaded the media");
      } else {
        toast.error("Something went wrong while uploading the media file");
      }
    }

    setDisabled(false);
    toast.dismiss(loadingToast);

    setShowing(false);
  };

  return (
    <AnimatePresence>
      {showing && (
        <Dialog
          open={true}
          onClose={() => setShowing(false)}
          className="fixed inset-0 flex h-full w-full items-center justify-center"
        >
          <Dialog.Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black opacity-75"
          ></Dialog.Overlay>

          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={spring}
            className="relative max-w-xl overflow-hidden rounded-md border-1 border-gray-300 bg-white"
          >
            <Dialog.Title className="relative flex w-full items-center justify-between border-b-1 border-gray-300 bg-gray-100 p-4 py-2">
              <span className="mr-auto text-sm font-semibold">
                Upload Media
              </span>

              <button
                className="icon-button icon-button--neutral icon-button--sm ml-2"
                onClick={() => setShowing(false)}
              >
                <IconX className="h-auto w-6" />
              </button>
            </Dialog.Title>

            <div className="p-4">
              <label
                htmlFor="upload_file_input"
                className={clsx(
                  "relative flex h-auto w-full flex-col items-center justify-center rounded-lg border-1 border-dashed py-10 text-center text-sm font-semibold",
                  [
                    disabled
                      ? "border-gray-500 bg-gray-50 text-gray-500 opacity-50"
                      : "border-indigo-500 bg-indigo-50 text-indigo-500 opacity-100",
                  ]
                )}
                {...bond}
              >
                <IconPhoto className="mb-2" />
                <span>Select Files To Upload</span>
              </label>
              <input
                type="file"
                id="upload_file_input"
                className="invisible"
                accept={MediaExtensions.map((ext) => "." + ext).join(",")}
                size={1024 * 1024 * 2}
                ref={inputRef}
                disabled={disabled}
                multiple={true}
                onChange={async (e) => {
                  if (!e?.target?.files) {
                    return;
                  }

                  await uploadFiles(e?.target?.files);
                }}
              />
            </div>

            <div className="relative flex w-full items-center justify-between border-b-1 border-gray-300 bg-gray-100 p-4 py-2">
              <button
                className="link-button link-button--neutral"
                onClick={() => setShowing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={() => setShowing(false)}
              >
                Done
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
