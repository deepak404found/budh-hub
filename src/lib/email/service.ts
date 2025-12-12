import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  connectionTimeout?: number;
  greetingTimeout?: number;
  socketTimeout?: number;
}

/**
 * Get SMTP configuration from environment variables
 */
export function getSMTPConfig(): SMTPConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !password) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  };
}

/**
 * Create nodemailer transporter
 */
export function createTransporter(): Transporter | null {
  const config = getSMTPConfig();
  if (!config) {
    return null;
  }

  return nodemailer.createTransport(config);
}

/**
 * Send email using centralized email service
 * Matches the approach used in NextAuth EmailProvider
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log("[EMAIL] Starting email send process...");
  console.log("[EMAIL] Options:", {
    to: options.to,
    subject: options.subject,
    from: options.from,
    htmlLength: options.html?.length || 0,
  });

  const config = getSMTPConfig();
  if (!config) {
    console.error("[EMAIL] ❌ SMTP configuration is missing");
    console.error("[EMAIL] Environment check:", {
      SMTP_HOST: process.env.SMTP_HOST ? "✓ Set" : "✗ Missing",
      SMTP_USER: process.env.SMTP_USER ? "✓ Set" : "✗ Missing",
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "✓ Set" : "✗ Missing",
      SMTP_PORT: process.env.SMTP_PORT || "587 (default)",
    });
    throw new Error("SMTP configuration is missing");
  }

  console.log("[EMAIL] ✓ SMTP config loaded:", {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passwordLength: config.auth.pass?.length || 0,
  });

  const transporter = createTransporter();
  if (!transporter) {
    console.error("[EMAIL] ❌ Failed to create email transporter");
    throw new Error("Failed to create email transporter");
  }

  console.log("[EMAIL] ✓ Transporter created successfully");

  const from = options.from || process.env.SMTP_FROM || config.auth.user;
  console.log("[EMAIL] Using 'from' address:", from);

  try {
    console.log("[EMAIL] Attempting to send email...");
    const result = await transporter.sendMail({
      to: options.to,
      from,
      subject: options.subject,
      html: options.html,
    });

    console.log("[EMAIL] ✅ Email sent successfully!");
    console.log("[EMAIL] Send result:", {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });
  } catch (sendError) {
    console.error("[EMAIL] ❌ Error during sendMail:", sendError);
    if (sendError instanceof Error) {
      console.error("[EMAIL] Error details:", {
        name: sendError.name,
        message: sendError.message,
        stack: sendError.stack,
      });
    }
    throw sendError;
  }
}

