import { NextRequest, NextResponse } from "next/server";
import { processExpiredAuctions } from "@/lib/queries/orders";

/**
 * API Route for processing expired auctions
 *
 * This endpoint can be used in two ways:
 * 1. Manual trigger: Call this endpoint to manually process expired auctions
 * 2. Vercel Cron: Configure in vercel.json to run automatically
 *
 * Security: Uses Vercel Cron Secret for authentication
 *
 * @see https://vercel.com/docs/cron-jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has valid authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify the request
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Process expired auctions
    const processedCount = await processExpiredAuctions();

    return NextResponse.json(
      {
        success: true,
        processedCount,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing expired auctions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
