import { NextRequest, NextResponse } from "next/server";
import { searchTimetable } from "@/lib/scraper";
import { NO_FACULTY_CAMPUS_CODES } from "@/lib/constants";
import type { SearchRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const { campus, faculty, course } = (body ?? {}) as Partial<SearchRequest>;

  if (!campus || typeof campus !== "string" || !campus.trim()) {
    return NextResponse.json({ error: "Missing or invalid field: campus" }, { status: 400 });
  }
  const facultyRequired = !NO_FACULTY_CAMPUS_CODES.has(campus.trim());
  if (facultyRequired && (!faculty || typeof faculty !== "string" || !faculty.trim())) {
    return NextResponse.json({ error: "Missing or invalid field: faculty" }, { status: 400 });
  }
  if (!course || typeof course !== "string" || !course.trim()) {
    return NextResponse.json({ error: "Missing or invalid field: course" }, { status: 400 });
  }

  try {
    const result = await searchTimetable({
      campus: campus.trim(),
      faculty: faculty.trim(),
      course: course.trim(),
    });

    if (result.entries.length === 0) {
      return NextResponse.json(
        { error: "No timetable found for the given course.", ...result },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("ECONNREFUSED") || message.includes("ENOTFOUND")) {
      return NextResponse.json(
        { error: "Could not reach UiTM timetable server.", detail: message },
        { status: 502 }
      );
    }

    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Request to UiTM server timed out. Please try again.", detail: message },
        { status: 504 }
      );
    }

    console.error("[/api/search]", message);
    return NextResponse.json(
      { error: "An unexpected error occurred.", detail: message },
      { status: 500 }
    );
  }
}
