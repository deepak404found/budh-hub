import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file") || `file-${Date.now()}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: file
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 10 });
  return NextResponse.json({ uploadUrl: signedUrl, key: file });
}


