import { auth } from "@/lib/auth/nextauth";

export async function getSession() {
  // NextAuth v5 beta uses auth() instead of getServerSession
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

