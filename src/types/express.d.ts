import { UserRole } from "../constants/user.js";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};