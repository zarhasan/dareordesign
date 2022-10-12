// import { AnimatePresence, motion } from 'framer-motion';
// import { isEmpty } from 'lodash-es';
// import { useRef, useState } from 'react';
// import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
// import { useDebounce } from 'react-use';
// import EmptyState from '~/components/EmptyState';
// import { findChallenges } from '~/queries/challenge.server';
// import { ChallengeObjectFull } from '~/schema/Challenge.server';
// import { authenticator } from '~/services/auth.server';
// import { ENV } from '~/utils/global';
// import slugify from '~/utils/slugify';

// import Button from '@mui/joy/Button';
// import { json, LoaderFunction } from '@remix-run/node';
// import { Form, Link, useLoaderData, useSearchParams, useSubmit } from '@remix-run/react';
// import { IconPlus, IconRefresh } from '@tabler/icons';

// export const loader: LoaderFunction = async ({ request }) => {
//   const url = new URL(request.url);

//   return json({
//     challenges: await findChallenges({
//       q: url.searchParams.get("q"),
//       tags: url.searchParams.getAll("tags"),
//     }),
//   });
// };

// export default function Challenges() {
//   const data = useLoaderData();
//   const [searchParams] = useSearchParams();
//   const [query, setQuery] = useState(searchParams.get("q") || "");
//   const submit = useSubmit();
//   const formRef = useRef(null);

//   const [, cancel] = useDebounce(
//     () => {
//       if (isEmpty(query)) return;
//       submit(formRef.current);
//     },
//     500,
//     [query]
//   );

//   return (
//     <div className="container my-10">
//       <div className="flex w-full flex-col items-start justify-start gap-4">
//         <h1 className="text-5xl font-bold">Challenges</h1>

//         <Form
//           className="ease-expo mt-6 flex h-12 w-full items-center justify-start overflow-hidden rounded-full border-1 border-gray-300 bg-gray-100 focus-within:bg-white"
//           ref={formRef}
//         >
//           <input
//             type="search"
//             placeholder="Search for challenges"
//             name={query && "q"}
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="h-full grow bg-transparent px-6 outline-none"
//           />
//         </Form>
//       </div>

//       <div className="mt-10">
//         {!data?.challenges || data?.challenges?.length < 1 ? (
//           <EmptyState
//             title="No Challenges Found"
//             description="Either there are no challenges or query has no results."
//             cta={
//               <div className="mt-6 flex items-center justify-center gap-4">
//                 <Link
//                   to="/dashboard/challenges/create"
//                   className="btn btn--primary"
//                 >
//                   <IconPlus className="mr-2 h-auto w-5" />
//                   Post A New Challenge
//                 </Link>

//                 <Link to="/challenges" className="btn btn--neutral">
//                   <IconRefresh className="mr-2 h-auto w-5" />
//                   Refresh The Page
//                 </Link>
//               </div>
//             }
//           />
//         ) : (
//           <List challenges={data?.challenges} />
//         )}
//       </div>
//     </div>
//   );
// }

// function List({ challenges }: { challenges: ChallengeObjectFull[] }) {
//   return (
//     <AnimatePresence>
//       <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 4 }}>
//         <Masonry gutter="1.5rem">
//           {challenges.map((challenge, index) => {
//             return <Card key={index} challenge={challenge} />;
//           })}
//         </Masonry>
//       </ResponsiveMasonry>
//     </AnimatePresence>
//   );
// }

// export function Card({ challenge }: { challenge: ChallengeObjectFull }) {
//   return (
//     <motion.div
//       layout="position"
//       className="relative rounded-lg border-1 border-gray-200 p-3"
//     >
//       <Link to={`/challenge/${slugify(challenge.name)}-${challenge._id}`}>
//         <img
//           className="h-auto w-full rounded-md object-cover object-top"
//           src={`${ENV.S3_BUCKET_PUBLIC_URL}/${challenge.images[0].key}`}
//         />
//       </Link>
//       <div className="px-2">
//         <h2 className="mt-3 text-sm font-semibold">{challenge.name}</h2>
//         <div className="mt-2 flex items-center justify-start gap-2 text-xs">
//           <img
//             src={challenge.user.profile.picture}
//             className="h-6 w-6 rounded-full object-cover"
//           />
//           <p>{challenge.user.name}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
