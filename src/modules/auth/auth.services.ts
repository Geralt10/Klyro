import { userModel } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { RegisterUserInput,LoginUserInput } from "./auth.validation.js";
import { generateVerificationToken, hashToken } from "../../utils/token.utils.js";
import { verifyRefreshToken } from "../../utils/jwt.utils.js";
import { sendVerificationEmail } from "../../services/email.service.js";


//registerUser
export const userRegister = async({
    name,
    email,
    password,
}:RegisterUserInput)=>{
    const existingUser = await userModel.findOne({ email });

    const verificationToken = generateVerificationToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationTokenExpiry = new Date(
      Date.now() + 60 * 60 * 1000
    );

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ApiError(409, "Email already registered.");
      }
    
      existingUser.verificationToken = hashedVerificationToken;
      existingUser.verificationTokenExpiry = verificationTokenExpiry;

      await existingUser.save({
        validateBeforeSave: false,
      });

      await sendVerificationEmail(
        existingUser.email,
        verificationToken
      );

      return existingUser;
    }

    const user = await userModel.create({    
      name,
      email,
      password,
      verificationToken: hashedVerificationToken,
      verificationTokenExpiry: verificationTokenExpiry,
    });

    await sendVerificationEmail(
      user.email,
      verificationToken
    );

    return user;
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

  user.save({
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