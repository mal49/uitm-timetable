import { NextRequest, NextResponse } from "next/server";
import { fetchSubjectTimetable, getMainPageInfo } from "@/lib/scraper";

export const runtime = "nodejs";
export const maxDuration = 60;

type TimetableByPathRequest = {
  path: string;
  course?: string;
  subject?: string;
};

const CACHE_TTL_MS = 20 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: unknown }>();

function getCached(key: string): unknown | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key: string, value: unknown) {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const { path, course, subject } = (body ?? {}) as Partial<TimetableByPathRequest>;

  if (!path || typeof path !== "string" || !path.trim()) {
    return NextResponse.json({ error: "Missing or invalid field: path" }, { status: 400 });
  }

  const normalizedPath = path.trim().replace(/^\//, "");
  const cacheKey = normalizedPath;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const info = await getMainPageInfo();
    const grouped = await fetchSubjectTimetable(normalizedPath, info.cookieHeader);

    const response = {
      course: (course ?? "").trim().toUpperCase(),
      subject: (subject ?? "").trim(),
      path: normalizedPath,
      grouped,
    };

    setCached(cacheKey, response);
    return NextResponse.json(response);
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

    console.error("[/api/timetable]", message);
    return NextResponse.json(
      { error: "An unexpected error occurred.", detail: message },
      { status: 500 }
    );
  }
}

