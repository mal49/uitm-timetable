import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, Inter, Playfair_Display } from "next/font/google";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

// Serif faces for the wallpaper styles; not preloaded since only the Wallpaper step uses them.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
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
      className={`${inter.variable} ${bricolage.variable} ${fraunces.variable} ${playfair.variable}`}
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
