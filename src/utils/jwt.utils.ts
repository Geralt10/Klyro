import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/config.js";

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    env.ACCESS_TOKEN_SECRET
  ) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    env.REFRESH_TOKEN_SECRET
  ) as JwtPayload;
};