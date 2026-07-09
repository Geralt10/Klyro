interface VerificationTemplateProps {
  verificationUrl: string;
}


export const verificationTemplate = (
  {verificationUrl}: VerificationTemplateProps
): string => {
  return `
    <h2>Welcome to Klyro 👋</h2>

    <p>Please verify your email by clicking the button below.</p>

    <a
      href="${verificationUrl}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
      "
    >
      Verify Email
    </a>

    <p>This verification link will expire in 1 hour.</p>

    <p>If you didn't create this account, you can safely ignore this email.</p>
  `;
};