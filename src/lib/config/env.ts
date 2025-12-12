/**
 * Centralized Environment Configuration
 *
 * All environment variables should be accessed through this file.
 * This provides:
 * - Default values for optional variables
 * - Type safety
 * - Single source of truth
 * - Easy to find and update all env vars
 */

// ============================================================================
// Database Configuration
// ============================================================================
export const dbConfig = {
  url: process.env.DATABASE_URL || "",
} as const;

if (!dbConfig.url) {
  console.warn("⚠️  DATABASE_URL is not set. Database operations will fail.");
}

// ============================================================================
// NextAuth Configuration
// ============================================================================
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || "",
  url:
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
} as const;

if (!authConfig.secret) {
  console.warn(
    "⚠️  NEXTAUTH_SECRET is not set. Authentication may not work properly."
  );
}

// ============================================================================
// SMTP/Email Configuration
// ============================================================================
export const smtpConfig = {
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || "587"),
  user: process.env.SMTP_USER || "",
  password: process.env.SMTP_PASSWORD || "",
  from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  secure: Number(process.env.SMTP_PORT || "587") === 465,
} as const;

export const isSMTPConfigured = (): boolean => {
  return !!(smtpConfig.host && smtpConfig.user && smtpConfig.password);
};

if (!isSMTPConfigured()) {
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

// ============================================================================
// Redis Configuration
// ============================================================================
export const redisConfig = {
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
} as const;

export const isRedisConfigured = (): boolean => {
  return !!(redisConfig.url && redisConfig.token);
};

if (!isRedisConfigured()) {
  console.warn(
    "⚠️  Upstash Redis credentials not found. AI cache and session storage will not work. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env file."
  );
}

// ============================================================================
// R2/Cloudflare Storage Configuration
// ============================================================================
export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || "",
  bucketName: process.env.R2_BUCKET_NAME || "",
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  publicUrl: process.env.R2_PUBLIC_URL || "",
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : "",
} as const;

export const isR2Configured = (): boolean => {
  return !!(
    r2Config.accountId &&
    r2Config.bucketName &&
    r2Config.accessKeyId &&
    r2Config.secretAccessKey
  );
};

if (!isR2Configured()) {
  console.warn(
    "⚠️  R2 configuration incomplete. File uploads will not work.\n" +
      "Required environment variables:\n" +
      "  - R2_ACCOUNT_ID\n" +
      "  - R2_BUCKET_NAME\n" +
      "  - R2_ACCESS_KEY_ID\n" +
      "  - R2_SECRET_ACCESS_KEY\n" +
      "  - R2_PUBLIC_URL (optional, for public file access)"
  );
}

// ============================================================================
// File Upload Configuration
// ============================================================================
export const uploadConfig = {
  // Video upload limits (in MB)
  maxVideoSizeMB: Number(process.env.MAX_VIDEO_SIZE_MB || "10"),
  // Study materials upload limits (in MB)
  maxMaterialSizeMB: Number(process.env.MAX_MATERIAL_SIZE_MB || "50"),
  // Convert to bytes for validation
  maxVideoSizeBytes:
    Number(process.env.MAX_VIDEO_SIZE_MB || "10") * 1024 * 1024,
  maxMaterialSizeBytes:
    Number(process.env.MAX_MATERIAL_SIZE_MB || "50") * 1024 * 1024,
} as const;

// ============================================================================
// App Configuration
// ============================================================================
export const appConfig = {
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// ============================================================================
// Seed Script Configuration (for development)
// ============================================================================
export const seedConfig = {
  adminEmail: process.env.ADMIN_EMAIL || "admin@budhhub.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@1234",
  adminName: process.env.ADMIN_NAME || "Admin",
  instructorEmail: process.env.INSTRUCTOR_EMAIL || "instructor@budhhub.com",
  instructorPassword: process.env.INSTRUCTOR_PASSWORD || "Instructor@1234",
  instructorName: process.env.INSTRUCTOR_NAME || "Instructor",
} as const;

// ============================================================================
// Export all configs
// ============================================================================
export const env = {
  db: dbConfig,
  auth: authConfig,
  smtp: smtpConfig,
  redis: redisConfig,
  r2: r2Config,
  upload: uploadConfig,
  app: appConfig,
  seed: seedConfig,
  // Helper functions
  isSMTPConfigured,
  isRedisConfigured,
  isR2Configured,
} as const;

// Type exports for use in other files
export type DBConfig = typeof dbConfig;
export type AuthConfig = typeof authConfig;
export type SMTPConfig = typeof smtpConfig;
export type RedisConfig = typeof redisConfig;
export type R2Config = typeof r2Config;
export type UploadConfig = typeof uploadConfig;
export type AppConfig = typeof appConfig;
