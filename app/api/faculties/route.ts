import { NextResponse } from "next/server";
import { fetchFaculties } from "@/lib/scraper";

export const runtime = "nodejs";

export async function GET() {
  try {
    const faculties = await fetchFaculties();
    return NextResponse.json(faculties);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/faculties]", message);
    return NextResponse.json(
      { error: "Failed to load faculty list.", detail: message },
      { status: 502 }
    );
  }
}
