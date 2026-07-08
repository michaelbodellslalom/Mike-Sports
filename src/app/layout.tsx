import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mike Sports",
  description: "Personal sports hub for scores, schedules, and recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
