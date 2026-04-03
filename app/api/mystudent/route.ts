import { NextResponse } from "next/server";

const STUDENT_ID_PATTERN = /^\d+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId")?.trim() ?? "";

  if (!STUDENT_ID_PATTERN.test(studentId)) {
    return NextResponse.json(
      { error: "Missing or invalid `studentId`. Use digits only." },
      { status: 400 },
    );
  }

  const upstreamUrl = `https://cdn.uitm.link/jadual/baru/${studentId}.json`;

  try {
    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "No timetable JSON was found for that student ID." },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch timetable JSON from the UiTM CDN.",
          detail: `Upstream status ${response.status}.`,
        },
        { status: 502 },
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Could not reach the UiTM CDN.",
        detail: message,
      },
      { status: 502 },
    );
  }
}
