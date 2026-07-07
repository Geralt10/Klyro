import { Request,Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { loginUser, logoutUser, refreshAccessToken, userRegister } from "./auth.services.js";
import { env } from "../../config/config.js";
import { CookieOptions } from "express";
import { accessTokenCookieOptions, refreshTokenCookieOptions, } from "../../config/cookie.config.js";

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


//refresh-token-controller
export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshAccessToken(refreshToken);

    return res
      .cookie(
        "accessToken",
        accessToken,
        accessTokenCookieOptions
      )
      .cookie(
        "refreshToken",
        newRefreshToken,
        refreshTokenCookieOptions
      )
      .status(200)
      .json(
        new ApiResponse(200,"Token refreshed successfully.",null)
      );
  }
);


//logout
export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    return res
      .clearCookie(
        "accessToken",
        accessTokenCookieOptions
      )
      .clearCookie(
        "refreshToken",
        refreshTokenCookieOptions
      )
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Logout successful.",
          null
        )
      );
  }
);