import { Request,Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getMe, loginUser, logoutUser, refreshAccessToken, resendVerificationService, userRegister, verifyEmailService } from "./auth.services.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions, } from "../../config/cookie.config.js";
import { ApiError } from "../../utils/ApiError.js";


export const registerController = asyncHandler(
    async(req:Request,res:Response)=>{
        const result = await userRegister(req.body);

        return res.status(201).json(
            new ApiResponse(
                201,
                "Registration successful. Please verify your email.",
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


//getMeController
export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getMe(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "User fetched successfully.",
        user
      )
    );
  }
);


//verifyEmail
export const verifyEmailController = asyncHandler(async(req:Request,res:Response,)=>{
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Verification token is required.");
  }

  await verifyEmailService(token);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Email verified successfully.",
       null,
    )
  );
}) 


//
export const resendVerificationController =asyncHandler(async(req:Request,res:Response,)=>{
const { email } = req.body;

await resendVerificationService(email);

return res.status(200).json(
  new ApiResponse(
    200,
    "Verification email sent successfully.",
    null
  )
);
})