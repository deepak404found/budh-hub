import { NextResponse } from "next/server";
import { signInSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate with Zod schema
    const validationResult = signInSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Email validation passed - NextAuth will handle the actual sign-in
    // This endpoint is mainly for validation consistency
    return NextResponse.json(
      { message: "Email validated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

