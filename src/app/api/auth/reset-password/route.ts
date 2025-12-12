import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import {
  getPasswordResetToken,
  deletePasswordResetToken,
} from "@/lib/redis/auth";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

// GET: Validate reset token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const resetToken = await getPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      await deletePasswordResetToken(token);
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Reset password token validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}

// POST: Reset password
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Get and validate reset token
    const resetToken = await getPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      await deletePasswordResetToken(token);
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find user by email
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, resetToken.email))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    await db
      .update(users)
      .set({ password_hash: passwordHash })
      .where(eq(users.id, userResults[0].id));

    // Delete reset token (single-use)
    await deletePasswordResetToken(token);

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}

