import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustMark Africa",
  description: "A workspace for checking suspicious messages and managing trust reports.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}