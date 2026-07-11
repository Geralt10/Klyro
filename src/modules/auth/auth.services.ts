import { userModel } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { RegisterUserInput,LoginUserInput,GoogleLoginInput } from "./auth.validation.js";
import { generateEmailVerificationToken, generateVerificationToken, hashToken } from "../../utils/token.utils.js";
import { verifyRefreshToken } from "../../utils/jwt.utils.js";
import { sendResetPasswordEmail, sendVerificationEmail } from "../../services/email.service.js";
import bcrypt from "bcrypt";
import { verifyGoogleCode } from "../../utils/google.js";

//registerUser
export const userRegister = async({
    name,
    email,
    password,
}:RegisterUserInput)=>{
    const existingUser = await userModel.findOne({ email });

    const {
      verificationToken,
      verificationTokenHashed,
      verificationTokenExpiry,
    } = generateEmailVerificationToken();

    if (existingUser) {

      if (existingUser.isVerified) {
        throw new ApiError(
          409,
          "Email already registered. Please login instead."
        );
      }

      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationToken = verificationTokenHashed;
      existingUser.verificationTokenExpiry = verificationTokenExpiry;

      await existingUser.save();

      await sendVerificationEmail(
        existingUser.email,
        verificationToken
      );

      return {
        user: existingUser,
      };
    }

    const user = await userModel.create({    
      name,
      email,
      password,
      verificationToken: verificationTokenHashed,
      verificationTokenExpiry: verificationTokenExpiry,
    });

    await sendVerificationEmail(
      user.email,
      verificationToken
    );

    return {
      user,
    };
  }


//loginUser
export const loginUser = async ({
  email,
  password,
}: LoginUserInput) => {
    const user = await userModel.findOne({ email }).select("+password +refreshToken");
    
    if(!user){
        throw new ApiError(401,"Invalid email or Password");
    }

    if (!user.password) {
      throw new ApiError(
        400,
        "This account uses Google Sign-In. Please continue with Google."
      );
    }
    
    const isPasswordCorrect = await user.comparePassword(password);

    
    if (!isPasswordCorrect) {
      throw new ApiError(401,"Invalid email or password");
    }

    if(!user.isVerified){
        throw new ApiError(409,"please verify your email first");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const hashedRefreshToken = hashToken(refreshToken);
    
    user.refreshToken = hashedRefreshToken;

    await user.save({
        validateBeforeSave:false,
    })

    return {
        user,
        accessToken,
        refreshToken
    }
    
};

//refresh-token-cycle
export const refreshAccessToken = async (
  refreshToken: string
) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }

  // 1. Verify JWT
  const payload = verifyRefreshToken(refreshToken);

  // 2. Find user
  const user = await userModel.findById(payload.id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // 3. Compare hashed refresh token
  const hashedRefreshToken = hashToken(refreshToken);

  if (hashedRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // 4. Generate new tokens
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // 5. Hash & save new refresh token
  user.refreshToken = hashToken(newRefreshToken);

  await user.save({
    validateBeforeSave: false,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


//logoutUser
export const logoutUser = async(refreshToken:string)=>{

  if(!refreshToken){
    throw new ApiError(401,"Refresh token is required")
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await userModel.findById(payload.id).select("+refreshToken");

  if(!user){
    throw new ApiError(401,"invalid refresh token")
  }
  
  const hashedRefreshToken = hashToken(refreshToken);

  if(hashedRefreshToken !== user.refreshToken){
    throw new ApiError(401,"invalid refresh token")
  }

  user.refreshToken="";

  await user.save({
    validateBeforeSave:false
  })

  return;
}

//getME

export const getMe = async(userId:string)=>{
const user = await userModel.findById(userId);

  if (!user) {
  throw new ApiError(404, "User not found.");
  }

  return user;

}


//verify-email
export const verifyEmailService = async (token: string) => {
  const hashedToken = hashToken(token);

  const user = await userModel.findOne({
    verificationToken: hashedToken,
  }).select("+verificationToken +verificationTokenExpiry");

  if (!user) {
    throw new ApiError(400, "Invalid verification token.");
  }

  if (
    !user.verificationTokenExpiry ||
    user.verificationTokenExpiry < new Date()
  ) {
    throw new ApiError(400, "Verification token has expired.");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  return user;
};

//resend email verificaiton
export const resendVerificationService = async (
  email: string
) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified.");
  }

  const {
    verificationToken,
    verificationTokenHashed,
    verificationTokenExpiry,
  } = generateEmailVerificationToken();

  user.verificationToken = verificationTokenHashed;
  user.verificationTokenExpiry = verificationTokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  await sendVerificationEmail(
    user.email,
    verificationToken
  );
};


//resetPassword
export const resetPasswordService = async (
  token: string,
  newPassword: string
) => {
  const hashedPasswordResetToken = hashToken(token);

  const user = await userModel.findOne({
    passwordResetToken: hashedPasswordResetToken,
  }).select(
    "+passwordResetToken +passwordResetTokenExpiry +refreshToken"
  );

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token.");
  }

  if (!user.isVerified) {
    throw new ApiError(
      403,
      "Email must be verified before resetting the password."
    );
  }

  if (
    !user.passwordResetTokenExpiry ||
    user.passwordResetTokenExpiry < new Date()
  ) {
    throw new ApiError(400, "Password reset token has expired.");
  }

  user.password = newPassword;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  // Invalidate existing session
  user.refreshToken = "";

  await user.save();
};


//forgotPassword
export const forgotPasswordService = async (
  email: string
) => {
  const user = await userModel.findOne({ email });

  // Prevent email enumeration
  if (!user || !user.isVerified) {
    return;
  }

  if (!user.password) {
    throw new ApiError(
        400,
        "Password reset is not available for Google accounts."
    );
  }

  const passwordResetToken = generateVerificationToken();

  const hashedPasswordResetToken =
    hashToken(passwordResetToken);

  user.passwordResetToken =
    hashedPasswordResetToken;

  user.passwordResetTokenExpiry = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await user.save({
    validateBeforeSave: false,
  });

  await sendResetPasswordEmail(
    user.email,
    passwordResetToken
  );
};


//changePassword
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await userModel.findById(userId).select(
    "+password +refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.password) {
    throw new ApiError(
        400,
        "Password change is not available for Google accounts."
    );
  }

  if(!user.isVerified){
    throw new ApiError(403,"Email must be verified before changing the password");
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password."
    );
  }

  user.password = newPassword;

  // Invalidate existing session
  user.refreshToken = "";

  await user.save();
};



export const googleLogin = async ({
  code,
}: GoogleLoginInput) => {
  const profile = await verifyGoogleCode(code);

  if (!profile.emailVerified) {
    throw new ApiError(
      401,
      "Google account email is not verified."
    );
  }

  // Existing Google account
  let user = await userModel
    .findOne({
      googleId: profile.googleId,
    })
    .select("+refreshToken");

  if (!user) {
    // Check if email already belongs to another account
    const existingUser = await userModel.findOne({
      email: profile.email,
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "An account with this email already exists. Please sign in using your existing method."
      );
    }

    // Create new Google account
    user = await userModel.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatar: profile.avatar,
      isVerified: true,
    });

    user = await userModel
      .findById(user._id)
      .select("+refreshToken");

    if (!user) {
      throw new ApiError(
        500,
        "Failed to create Google account."
      );
    }
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = hashToken(refreshToken);

  await user.save({
    validateBeforeSave: false,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};