import { NextResponse } from "next/server";
import { signInSchema } from "@/lib/validations/auth";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { setPasswordResetToken } from "@/lib/redis/auth";
import { generatePasswordResetTemplate } from "@/lib/auth/email-template";
import { sendEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  console.log("[FORGOT-PASSWORD] ===== Password Reset Request Started =====");

  try {
    const body = await request.json();
    console.log("[FORGOT-PASSWORD] Request body received");

    // Validate email
    const validationResult = signInSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "[FORGOT-PASSWORD] ❌ Validation failed:",
        validationResult.error.issues
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    console.log("[FORGOT-PASSWORD] ✓ Email validated:", email);

    // Check if user exists
    console.log("[FORGOT-PASSWORD] Checking if user exists in database...");
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log("[FORGOT-PASSWORD] User query result:", {
      found: userResults.length > 0,
      hasPassword: userResults[0]?.password_hash ? true : false,
    });

    // Check if user exists
    if (userResults.length === 0) {
      console.log("[FORGOT-PASSWORD] ❌ User not found");
      return NextResponse.json(
        {
          error: "No account found with this email address.",
        },
        { status: 404 }
      );
    }

    // Allow password reset even if user doesn't have a password set yet
    // This enables users who signed up with magic link to set a password
    const user = userResults[0];
    if (!user.password_hash) {
      console.log(
        "[FORGOT-PASSWORD] ⚠️  User found but no password set - allowing reset to set password"
      );
    } else {
      console.log(
        "[FORGOT-PASSWORD] ✓ User found with password - proceeding with reset"
      );
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration
    console.log(
      "[FORGOT-PASSWORD] Reset token generated, expires at:",
      expires.toISOString()
    );

    // Store token in Redis
    console.log("[FORGOT-PASSWORD] Storing reset token in Redis...");
    try {
      await setPasswordResetToken(email, resetToken, expires);
      console.log("[FORGOT-PASSWORD] ✓ Reset token stored in Redis");
    } catch (redisError) {
      console.error(
        "[FORGOT-PASSWORD] ❌ Error storing token in Redis:",
        redisError
      );
      throw redisError;
    }

    // Generate reset URL
    const { appConfig } = await import("@/lib/config/env");
    const resetUrl = `${appConfig.url}/auth/reset-password?token=${resetToken}`;
    console.log("[FORGOT-PASSWORD] Reset URL generated:", resetUrl);

    // Send reset email using centralized email service
    // Match the approach used in NextAuth EmailProvider
    try {
      const { host } = new URL(resetUrl);
      console.log(
        "[FORGOT-PASSWORD] Generating email template for host:",
        host
      );

      const emailHtml = generatePasswordResetTemplate(resetUrl, host, email);
      console.log(
        "[FORGOT-PASSWORD] ✓ Email template generated, HTML length:",
        emailHtml.length
      );

      console.log("[FORGOT-PASSWORD] Calling sendEmail service...");
      await sendEmail({
        to: email,
        subject: `Reset your password - ${host}`,
        html: emailHtml,
      });

      console.log(
        "[FORGOT-PASSWORD] ✅ Password reset email sent successfully to",
        email
      );

      console.log(
        "[FORGOT-PASSWORD] ===== Password Reset Request Completed Successfully ====="
      );
      return NextResponse.json(
        {
          message: "Password reset link has been sent to your email.",
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error(
        "[FORGOT-PASSWORD] ❌ Error sending password reset email:",
        emailError
      );
      if (emailError instanceof Error) {
        console.error("[FORGOT-PASSWORD] Email error details:", {
          name: emailError.name,
          message: emailError.message,
          stack: emailError.stack,
        });
      }

      // Return actual error instead of generic success
      return NextResponse.json(
        {
          error:
            "Failed to send password reset email. Please try again later or contact support.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[FORGOT-PASSWORD] ❌❌❌ FATAL ERROR ❌❌❌");
    console.error("[FORGOT-PASSWORD] Error:", error);
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error("[FORGOT-PASSWORD] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
