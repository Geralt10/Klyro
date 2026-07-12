import { UserRole } from "../constants/user.js";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
      };

      file?: Multer.File;

      files?: Multer.File[];
    }
  }
}

export {};