import { S3Client } from "@aws-sdk/client-s3";
import { r2Config, isR2Configured } from "@/lib/config/env";

// Only show warnings in development
if (process.env.NODE_ENV === "development" && !isR2Configured()) {
  console.warn("⚠️  R2 is not configured. R2 client will not work properly.");
}

export const r2 = isR2Configured()
  ? new S3Client({
      region: "auto",
      endpoint: r2Config.endpoint,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    })
  : (null as unknown as S3Client); // Type assertion for optional R2
