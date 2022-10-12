import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import { database } from '~/libs/mongo.server';
import { UserObject, UserSchema } from '~/schema/User.server';
import { GoogleStrategy } from '~/services/auth-strategies/google';
import { sessionStorage } from '~/services/session.server';

export let authenticator = new Authenticator(sessionStorage);

if (
  !process.env.GITHUB_OAUTH_CLIENT_ID ||
  !process.env.GITHUB_OAUTH_CLIENT_SECRET ||
  !process.env.GITHUB_OAUTH_CALLBACK
) {
  throw new Error(
    "Please set `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET` and `GITHUB_OAUTH_CALLBACK`"
  );
}

let gitHubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_OAUTH_CALLBACK,
  },
  async ({ accessToken, extraParams, profile }) => {
    const data = {
      provider: profile.provider,
      name: profile._json.name,
      email: profile?.emails?.[0]?.value,
      profile: {
        id: profile.id,
        picture: profile._json.avatar_url,
      },
    };

    const safeData = UserSchema.parse(data);

    const updatedDocument: { value: UserObject } = await database
      .collection("users")
      .findOneAndUpdate(
        { email: safeData.email, provider: profile.provider },
        { $set: safeData },
        { upsert: true, returnDocument: "after" }
      );

    return updatedDocument?.value;
  }
);

if (
  !process.env.GOOGLE_OAUTH_CLIENT_ID ||
  !process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  !process.env.GOOGLE_OAUTH_CALLBACK
) {
  throw new Error(
    "Please set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` and `GOOGLE_OAUTH_CALLBACK`"
  );
}

let googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_OAUTH_CALLBACK,
  },
  async ({ accessToken, extraParams, profile }) => {
    const data = {
      provider: profile.provider,
      name: profile.displayName,
      email: profile?.emails?.[0]?.value,
      profile: {
        id: profile.id,
        picture: profile?.photos?.[0]?.value,
      },
    };

    const safeData = UserSchema.parse(data);

    const updatedDocument: { value: UserObject } = await database
      .collection("users")
      .findOneAndUpdate(
        { email: safeData.email, provider: profile.provider },
        { $set: safeData },
        { upsert: true, returnDocument: "after" }
      );

    return updatedDocument?.value;
  }
);

authenticator.use(gitHubStrategy);
authenticator.use(googleStrategy);
