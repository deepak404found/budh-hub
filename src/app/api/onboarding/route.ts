import { NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/nextauth";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    // Get the current user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate with Zod schema
    const validationResult = onboardingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { role, name, bio, password } = validationResult.data;

    // Validate password strength if provided
    if (password) {
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
    }

    // Find the existing user by email (created by NextAuth)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Update the existing user with onboarding data
    const updateData: {
      name: string;
      role: string;
      password_hash?: string;
    } = {
      name,
      role,
    };

    if (passwordHash) {
      updateData.password_hash = passwordHash;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, existingUser[0].id))
      .returning();

    return NextResponse.json(
      {
        message: "Onboarding completed successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding. Please try again." },
      { status: 500 }
    );
  }
}
