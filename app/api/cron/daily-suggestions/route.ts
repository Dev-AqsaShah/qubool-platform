import { NextResponse } from "next/server";
import { generateDailySuggestions } from "@/lib/matching/suggestions";

// Vercel Cron hits this daily. Protect with CRON_SECRET so it can't be
// triggered by anyone who guesses the URL.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateDailySuggestions();
  return NextResponse.json(result);
}
