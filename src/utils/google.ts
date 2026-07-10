import { OAuth2Client } from "google-auth-library";
import { env } from "../config/config.js";

const oauthClient = new OAuth2Client({
  clientId: env.SMTP_CLIENT_ID,
  clientSecret: env.SMTP_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI
});

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatar: string;
}

export async function verifyGoogleCode(
  code: string
): Promise<GoogleProfile> {
  const { tokens } = await oauthClient.getToken({code,redirect_uri: env.GOOGLE_REDIRECT_URI,});

  if (!tokens.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.SMTP_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Unable to retrieve Google profile.");
  }

  if (!payload.sub || !payload.email) {
    throw new Error("Invalid Google profile.");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified ?? false,
    name: payload.name ?? "",
    avatar: payload.picture ?? "",
  };
}