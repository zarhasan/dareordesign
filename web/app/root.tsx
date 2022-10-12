import { Toaster } from 'react-hot-toast';
import tailwind from '~/css/tailwind.output.css';
import Header from '~/elements/Header';
import { authenticator } from '~/services/auth.server';

import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import { json, LoaderFunction, MetaFunction } from '@remix-run/node';
import {
    Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, useLoaderData
} from '@remix-run/react';

import EmptyState from './components/EmptyState';
import Footer from './elements/Footer';

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    },
  ];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);

  return json({ user: user });
};

const theme = extendTheme({
  fontFamily: {
    display: "Inter, var(--joy-fontFamily-fallback)",
    body: "Inter, var(--joy-fontFamily-fallback)",
  },
});

export default function App() {
  const data = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <CssVarsProvider theme={theme}>
        <body>
          <Header user={data.user} />
          <main>
            <Outlet />
          </main>

          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
          />

          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <Footer />
        </body>
      </CssVarsProvider>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>{caught.statusText}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <EmptyState
          title={`${caught.status}`}
          description={caught.statusText}
          cta={
            <Link to="/" className="btn btn--primary btn--md mt-4">
              Go To Homepage
            </Link>
          }
        />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html>
      <head>
        <title>{error.message}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <EmptyState
          title={"Something went wrong"}
          cta={
            <Link to="/" className="btn btn--primary btn--md mt-4">
              Go To Homepage
            </Link>
          }
        />
        <Scripts />
      </body>
    </html>
  );
}
