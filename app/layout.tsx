import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./work-map.css";

const fidelitySans = localFont({
  src: [
    { path: "./fonts/FidelitySans-Light.woff", weight: "300", style: "normal" },
    {
      path: "./fonts/FidelitySans-Regular.woff",
      weight: "400",
      style: "normal",
    },
    { path: "./fonts/FidelitySans-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-fidelity-sans",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Periscope · UXD workspace",
  description: "UXD projects, reporting structure, priorities, and capacity.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fidelitySans.variable}>
      <body>{children}</body>
    </html>
  );
}
