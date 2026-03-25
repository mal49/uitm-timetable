import { NextRequest, NextResponse } from "next/server";
import { fetchTimetable } from "@/lib/scraper";
import type { TimetableRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { campus, faculty, course } = (body ?? {}) as Partial<TimetableRequest>;

  if (!campus || typeof campus !== "string" || campus.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: campus" },
      { status: 400 }
    );
  }
  if (!faculty || typeof faculty !== "string" || faculty.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: faculty" },
      { status: 400 }
    );
  }
  if (!course || typeof course !== "string" || course.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: course" },
      { status: 400 }
    );
  }

  try {
    const result = await fetchTimetable({
      campus: campus.trim(),
      faculty: faculty.trim(),
      course: course.trim(),
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.startsWith("NO_RESULTS")) {
      return NextResponse.json(
        { error: "No timetable found for the given course.", detail: message },
        { status: 404 }
      );
    }

    if (message.includes("ECONNREFUSED") || message.includes("ENOTFOUND") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Could not reach UiTM timetable server. Try again later.", detail: message },
        { status: 502 }
      );
    }

    if (message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request to UiTM server timed out. Try again.", detail: message },
        { status: 504 }
      );
    }

    console.error("[/api/timetable] Unhandled error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the timetable.", detail: message },
      { status: 500 }
    );
  }
}
