import { Schema, model } from "mongoose";
import { UserRole } from "../../constants/user.js";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken"
import { env } from "../../config/config.js";


export interface IUser {
  name: string;
  email: string;
  googleId?: string;
  password?: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  refreshToken: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  passwordResetTokenExpiry?:Date;
  passwordResetToken?:string;

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
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    password: {
      type: String,
      required:function (this:IUser) {
        return !this.googleId;
      },
      select: false,
    },

    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp&s=512",
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
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
    passwordResetToken:{
      type:String,
      select:false
    },
    passwordResetTokenExpiry:{
      type:Date,
      select:false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returned) => {
        const sanitized = returned as Partial<IUser>;

        delete sanitized.password;
        delete sanitized.refreshToken;
        delete sanitized.verificationToken;
        delete sanitized.verificationTokenExpiry;
        delete sanitized.passwordResetToken;
        delete sanitized.passwordResetTokenExpiry;
        return returned;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password!, 10);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }

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
