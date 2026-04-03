import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "UiTM Schedule",
  description:
    "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
  metadataBase: new URL("https://uitm-timetable.vercel.app"),
  openGraph: {
    title: "UiTM Schedule",
    description:
      "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
    url: "https://uitm-timetable.vercel.app",
    siteName: "UiTM Schedule",
    type: "website",
    locale: "en_MY",
    images: [
      {
        url: "/social-preview.jpg",
        width: 1200,
        height: 630,
        alt: "UiTM Schedule preview card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UiTM Schedule",
    description:
      "Search UiTM class schedules, pick your groups, and turn your final timetable into a custom wallpaper.",
    images: ["/social-preview.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${roboto.className}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
