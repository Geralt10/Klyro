import { userModel } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { RegisterUserInput,LoginUserInput } from "./auth.validation.js";
import { hashRefreshToken } from "../../utils/token.js";
import { verifyRefreshToken } from "../../utils/jwt.utils.js";


//registerUser
export const userRegister = async({
    name,
    email,
    password,
}:RegisterUserInput)=>{
    const userExist = await userModel.findOne({email});

    if(userExist){
        throw new ApiError(409,"email already exists");
    }
    
    const user = await userModel.create({
        name,
        email,
        password
    })

    return user

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

    const hashedRefreshToken = hashRefreshToken(refreshToken);
    
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
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  if (hashedRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // 4. Generate new tokens
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // 5. Hash & save new refresh token
  user.refreshToken = hashRefreshToken(newRefreshToken);

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
  
  const hashedRefreshToken = hashRefreshToken(refreshToken);

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