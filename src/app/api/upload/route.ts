import { NextRequest, NextResponse } from "next/server";
import {
  uploadFileToS3,
  isValidImageType,
  isValidFileSize,
} from "@/lib/aws-s3";

// API Key for public uploads (should be set in environment variables)
const PUBLIC_UPLOAD_API_KEY = process.env.PUBLIC_UPLOAD_API_KEY || "";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 uploads per minute per IP

// In-memory rate limit store (in production, use Redis or similar)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Helper function to check rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Increment count
  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIP || "unknown";
  return ip;
}

// Helper function to verify API key
function verifyAPIKey(request: NextRequest): boolean {
  if (!PUBLIC_UPLOAD_API_KEY) {
    console.warn("PUBLIC_UPLOAD_API_KEY not set in environment variables");
    return false;
  }

  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return false;
  }

  return apiKey === PUBLIC_UPLOAD_API_KEY;
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!verifyAPIKey(request)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Check rate limit
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} uploads per minute. Please try again later.`,
        },
        { status: 429 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "cccd";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit for public uploads)
    if (!isValidFileSize(file.size, 10)) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const uploadResult = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      folder
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: uploadResult.error || "Upload failed",
        },
        { status: 500 }
      );
    }

    // Return the uploaded file URL
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
