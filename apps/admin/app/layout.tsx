import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RollRush Admin",
  description: "RollRush operations dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
