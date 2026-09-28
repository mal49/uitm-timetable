import type { Metadata } from "next";
import { HomePage } from "@/app/_home/home-page";

export const metadata: Metadata = {
  title: "Build your timetable · UiTM Schedule",
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id, tab } = await searchParams;
  return (
    <HomePage
      initialStudentId={typeof id === "string" ? id.trim() : undefined}
      initialTab={tab === "search" ? "search" : "id"}
    />
  );
}
