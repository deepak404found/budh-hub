import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware for authentication and route protection
 * Uses JWT token to check authentication status
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/courses", "/my-courses", "/admin", "/instructor"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (token) {
    if (pathname === "/auth/sign-in" || pathname === "/auth/forgot-password") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Allow access to onboarding if user is authenticated (they might need to complete it)
    // But if they already completed onboarding, redirect to dashboard
    if (pathname === "/onboarding") {
      // Check if user has completed onboarding by checking if they have a role
      // This is a simple check - you might want to add a more sophisticated check
      return NextResponse.next();
    }
  }

  // If user is not authenticated and tries to access protected routes, redirect to sign-in
  if (!token && isProtectedRoute) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


