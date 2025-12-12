/**
 * Generate HTML email template for NextAuth magic link
 */
export function generateEmailTemplate(url: string, host: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to BudhHub</title>
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="background-color: #18181b; padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">
          🎓 BudhHub LMS
        </h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 32px 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #18181b;">
          Welcome! Sign in to your account
        </h2>

        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #52525b;">
          Click the button below to securely sign in to your BudhHub account.
          This link will expire in 24 hours for your security.
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 0 0 24px 0;">
              <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Sign in to BudhHub
              </a>
            </td>
          </tr>
        </table>

        <!-- Alternative Link -->
        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: #71717a;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f4f4f5; border-radius: 6px; font-size: 12px; font-family: monospace; color: #18181b; word-break: break-all;">
          ${url}
        </p>

        <!-- Security Notice -->
        <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
            <strong>🔒 Security Notice:</strong><br>
            If you didn't request this email, you can safely ignore it.
            This link will only work once and expires in 24 hours.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
          This email was sent to <strong>${email}</strong>
        </p>
        <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
          © ${new Date().getFullYear()} BudhHub LMS. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

