import { NextRequest, NextResponse } from "next/server";

// API Key for public uploads (should be set in environment variables)
const PUBLIC_UPLOAD_API_KEY = process.env.PUBLIC_UPLOAD_API_KEY || "";

// Rate limiting for token requests
const TOKEN_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const TOKEN_RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 token requests per minute per IP

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const tokenRateLimitStore = new Map<string, RateLimitEntry>();

function checkTokenRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = tokenRateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    tokenRateLimitStore.set(ip, {
      count: 1,
      resetTime: now + TOKEN_RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= TOKEN_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of tokenRateLimitStore.entries()) {
    if (now > entry.resetTime) {
      tokenRateLimitStore.delete(ip);
    }
  }
}, TOKEN_RATE_LIMIT_WINDOW);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIP || "unknown";
  return ip;
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    if (!checkTokenRateLimit(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Return the API key (this is safe because it's a public upload key)
    // In production, you might want to generate temporary tokens instead
    if (!PUBLIC_UPLOAD_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Upload service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        apiKey: PUBLIC_UPLOAD_API_KEY,
      },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
