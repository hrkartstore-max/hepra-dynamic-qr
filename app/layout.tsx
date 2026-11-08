import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEPRA Dynamic QR",
  description: "Create and manage dynamic QR and NFC review cards for local businesses.",
  applicationName: "HEPRA Dynamic QR"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}