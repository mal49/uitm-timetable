import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UiTM Class Canvas",
  description: "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
  metadataBase: new URL("https://uitm-timetable.vercel.app"),
  openGraph: {
    title: "UiTM Class Canvas",
    description:
      "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
    url: "https://uitm-timetable.vercel.app",
    siteName: "UiTM Class Canvas",
    type: "website",
    locale: "en_MY",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "UiTM Class Canvas preview card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UiTM Class Canvas",
    description:
      "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
    images: ["/twitter-image"],
  },
};

export const viewport = "width=device-width, initial-scale=1, maximum-scale=5";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
