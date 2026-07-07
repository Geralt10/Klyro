import { Request,Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { loginUser, userRegister } from "./auth.services.js";
import { env } from "../../config/config.js";
import { CookieOptions } from "express";

export const registerController = asyncHandler(
    async(req:Request,res:Response)=>{
        const result = await userRegister(req.body);

        return res.status(201).json(
            new ApiResponse(
                201,
                "user registered successfully",
                result
            )
        )
    }
)

export const loginController = asyncHandler(
    async(req:Request, res:Response)=>{
        const {user,accessToken,refreshToken} = await loginUser(req.body);

        const accessTokenCookieOptions:CookieOptions = {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        };

        const refreshTokenCookieOptions:CookieOptions = {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie("accessToken", accessToken, accessTokenCookieOptions);

        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        return res.status(200).json(
         new ApiResponse(
            200,
            "Login successful",
            user
          )
        );
    }
)