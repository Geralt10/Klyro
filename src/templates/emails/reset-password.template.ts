interface ResetPasswordTemplateProps {
  resetPasswordUrl: string;
}


export const resetPasswordTemplate = (
  {resetPasswordUrl}: ResetPasswordTemplateProps
): string => {
  return `
    <h2>Reset Your Password</h2>

    <p>Click the button below to reset your password.</p>

    <a
      href="${resetPasswordUrl}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#dc2626;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
      "
    >
      Reset Password
    </a>

    <p>This link will expire in 15 minutes.</p>

    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `;
};