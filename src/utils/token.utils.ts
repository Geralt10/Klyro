import crypto from "crypto";

export const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateEmailVerificationToken = () => {
  const verificationToken = generateVerificationToken();

  const verificationTokenHashed =
    hashToken(verificationToken);

  const verificationTokenExpiry = new Date(
    Date.now() + 60 * 60 * 1000
  );

  return {
    verificationToken,
    verificationTokenHashed,
    verificationTokenExpiry,
  };
};