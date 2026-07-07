import { userModel } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { RegisterUserInput,LoginUserInput } from "./auth.validation.js";
import { hashRefreshToken } from "../../utils/token.js";

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

    await user.save({
        validateBeforeSave:false,
    })

    return {
        user,
        accessToken,
        refreshToken
    }
    
};
