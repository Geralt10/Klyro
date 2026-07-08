import { Schema, model } from "mongoose";
import { UserRole } from "../../constants/user.js";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken"
import { env } from "../../config/config.js";

export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  refreshToken: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken=  function(): string{
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
}

userSchema.methods.generateRefreshToken=  function(): string{
  return jwt.sign(
    {
      id: this._id,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
}



export const userModel =model<IUser>("User", userSchema);
