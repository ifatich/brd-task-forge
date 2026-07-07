import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Body font — Inter: clean, highly legible, modern-minimalist.
 * The industry standard for premium web UIs.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Heading font — Space Grotesk: geometric, tech-forward, distinctly modern.
 * Pairs perfectly with a navy dark theme.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Monospace font — JetBrains Mono: crisp, legible, developer-centric.
 * Used for code snippets, IDs, and technical data.
 */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRD Task Forge",
  description:
    "Ubah dokumen BRD jadi daftar tugas UI/UX Designer — otomatis dengan AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground bg-dots">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
