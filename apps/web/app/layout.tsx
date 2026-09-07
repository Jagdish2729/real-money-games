import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Money Games",
  description: "Secure and transparent prediction games.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
