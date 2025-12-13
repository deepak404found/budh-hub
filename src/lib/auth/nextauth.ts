import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { createRedisAdapter } from "./redis-adapter";
import { generateEmailTemplate as EmailTemplate } from "./email-template";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { verifyPassword } from "./password";
import { getUserRole } from "./roles";
import type { UserRole } from "@/lib/types/roles";
import { smtpConfig, authConfig, isSMTPConfigured } from "@/lib/config/env";

export const authOptions = {
  trustHost: true, // Trust all hosts (works for localhost and production)
  adapter: createRedisAdapter(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!userResults[0] || !userResults[0].password_hash) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password as string,
            userResults[0].password_hash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: userResults[0].id,
            email: userResults[0].email,
            name: userResults[0].name || undefined,
            role: (userResults[0].role as UserRole) || "LEARNER",
          };
        } catch (error) {
          console.error("Error in Credentials authorize:", error);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: smtpConfig.host || "smtp.gmail.com",
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password,
        },
        // Add connection timeout
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      },
      from: smtpConfig.from || smtpConfig.user || "noreply@example.com",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url);
        
        // Generate the email template
        const emailHtml = EmailTemplate(url, host, email);

        // Send email using centralized email service
        const { sendEmail } = await import("@/lib/email");
        
        await sendEmail({
          to: email,
          from: provider.from,
          subject: `Sign in to ${host}`,
          html: emailHtml,
        });
      },
    })
  ],
  secret: authConfig.secret,
  session: { strategy: "jwt" as const },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      // Handle callbackUrl from query params
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow relative callback URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, account, user }: { token: any; account?: any; user?: any }) {
      // On initial sign in, fetch role from database
      if (user?.id && !token.role) {
        const role = await getUserRole(user.id);
        token.role = role || "LEARNER";
      }
      
      // If role is not in token, fetch it (for existing sessions)
      if (token.sub && !token.role) {
        const role = await getUserRole(token.sub);
        token.role = role || "LEARNER";
      }

      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Include role and user id in session
      if (session.user) {
        // Ensure user.id is set from token.sub (NextAuth standard)
        session.user.id = token.sub || session.user.id;
        session.user.role = (token.role as UserRole) || "LEARNER";
        session.user.accessToken = token.accessToken;
      }
      return session;
    }
  } as any
};

export const { auth, handlers } = NextAuth(authOptions);

