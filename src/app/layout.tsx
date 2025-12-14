import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { VoiceAISystem } from "@/components/voice/voice-ai-system";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIFA - AI-Powered Learning Platform",
  description: "Transform your learning journey with personalized AI tutoring, custom roadmaps, and adaptive assessments.",
  keywords: ["AIFA", "AI Tutor", "Personalized Learning", "Education", "AI", "Tutoring", "Roadmaps"],
  authors: [{ name: "AIFA Team" }],
  icons: {
    icon: "/aifa-logo.svg",
  },
  openGraph: {
    title: "AIFA - AI-Powered Learning Platform",
    description: "Transform your learning journey with personalized AI tutoring, custom roadmaps, and adaptive assessments.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIFA - AI-Powered Learning Platform",
    description: "Transform your learning journey with personalized AI tutoring, custom roadmaps, and adaptive assessments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <VoiceAISystem />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
