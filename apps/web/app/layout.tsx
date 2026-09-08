import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RollRush – Roll. Toss. Win.",
  description: "RollRush is a secure and transparent prediction-game experience for dice and coin toss games.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
