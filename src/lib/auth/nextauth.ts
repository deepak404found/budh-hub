import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { createRedisAdapter } from "./redis-adapter";
import { generateEmailTemplate as EmailTemplate } from "./email-template";

// Validate SMTP configuration
const smtpConfig = {
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM,
};

if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
  console.warn(
    "⚠️  SMTP configuration incomplete. Email authentication will not work.\n" +
    "Required environment variables:\n" +
    "  - SMTP_HOST (e.g., smtp.gmail.com)\n" +
    "  - SMTP_USER (your email address)\n" +
    "  - SMTP_PASSWORD (for Gmail: use an App Password, not your regular password)\n" +
    "  - SMTP_FROM (sender email, defaults to SMTP_USER)\n" +
    "  - SMTP_PORT (defaults to 587)\n\n" +
    "Gmail App Password setup: https://support.google.com/accounts/answer/185833"
  );
}

export const authOptions = {
  adapter: createRedisAdapter(),
  providers: [
    EmailProvider({
      server: {
        host: smtpConfig.host || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465, // true for 465, false for other ports
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

        // Send email using nodemailer
        const server = provider.server as {
          host: string;
          port: number;
          secure: boolean;
          auth: { user: string; pass: string };
        };
        
        const nodemailer = await import("nodemailer");
        
        const transporter = nodemailer.createTransport({
          host: server.host,
          port: server.port,
          secure: server.secure,
          auth: server.auth,
        });

        await transporter.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to ${host}`,
          html: emailHtml,
        });
      },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, account }: { token: any; account?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = { ...session.user, accessToken: token.accessToken };
      return session;
    }
  } as any
};

export const { auth, handlers } = NextAuth(authOptions);

