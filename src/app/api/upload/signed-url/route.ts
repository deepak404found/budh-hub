import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2/client";
import { r2Config, isR2Configured } from "@/lib/config/env";

export async function GET(req: Request) {
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 storage is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const file = url.searchParams.get("file") || `file-${Date.now()}`;

  const command = new PutObjectCommand({
    Bucket: r2Config.bucketName,
    Key: file,
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 10 });
  return NextResponse.json({ uploadUrl: signedUrl, key: file });
}
