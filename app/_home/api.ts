import type {
  SearchRequest,
  SubjectsResponse,
  TimetableByPathRequest,
  TimetableByPathResponse,
} from "@/lib/types";

async function postJson<TResponse>(
  url: string,
  payload: unknown,
): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as TResponse & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed.");
  return json;
}

export function fetchSubjects(request: SearchRequest) {
  return postJson<SubjectsResponse>("/api/subjects", request);
}

export function fetchTimetableByPath(payload: TimetableByPathRequest) {
  return postJson<TimetableByPathResponse>("/api/timetable", payload);
}
