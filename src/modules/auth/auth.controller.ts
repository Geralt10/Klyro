import { Request,Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { changePasswordService, forgotPasswordService, getMe, loginUser, logoutUser, refreshAccessToken, resendVerificationService, resetPasswordService, userRegister, verifyEmailService } from "./auth.services.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions, } from "../../config/cookie.config.js";
import { ApiError } from "../../utils/ApiError.js";
import { googleLogin } from "./auth.services.js";


//register
export const registerController = asyncHandler(
    async(req:Request,res:Response)=>{
        const { user, requiresEmailVerification } =await userRegister(req.body);

        const message = requiresEmailVerification
          ? "Registration successful. Please verify your email."
          : "Registration successful.";

        return res.status(201).json(
          new ApiResponse(
            201,
            message,
            user
          )
        );
    }
)


//login
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


//resend-verification-email
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



//resetPassword
export const resetPasswordController = asyncHandler(async(req:Request,res:Response)=>{
  const { token, password } = req.body;

  await resetPasswordService(token, password);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password reset successfully.",
      null,
    )
  );
})


//forgot-password
export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await forgotPasswordService(email);

    return res.status(200).json(
      new ApiResponse(
        200,
        "If an account exists, a password reset link has been sent.",
        null,
      )
    );
  }
);


//change-password
export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    await changePasswordService(
      req.user.id,
      currentPassword,
      newPassword
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Password changed successfully.",
        null,
      )
    );
  }
);

export const googleLoginController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      user,
      accessToken,
      refreshToken,
    } = await googleLogin(req.body);

    res.cookie(
      "accessToken",
      accessToken,
      accessTokenCookieOptions
    );

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshTokenCookieOptions
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Google login successful.",
        user
      )
    );
  }
);