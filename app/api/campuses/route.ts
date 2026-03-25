import { NextResponse } from "next/server";
import { fetchCampuses } from "@/lib/scraper";

export const runtime = "nodejs";

export async function GET() {
  try {
    const campuses = await fetchCampuses();
    return NextResponse.json(campuses);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/campuses]", message);
    return NextResponse.json(
      { error: "Failed to load campus list.", detail: message },
      { status: 502 }
    );
  }
}
