import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import ScrollCar from "@/components/ScrollCar";
import RobotGate from "@/components/RobotGate";
import Cursor from "@/components/Cursor";
import Terminal from "@/components/Terminal";
import PageWipe from "@/components/PageWipe";
import LidarPlayground from "@/components/LidarPlayground";
import SubPlayground from "@/components/SubPlayground";
import DiveMode from "@/components/DiveMode";
import Weather from "@/components/Weather";
import Tilt from "@/components/Tilt";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// absolute URLs for link previews; Vercel fills VERCEL_PROJECT_PRODUCTION_URL on deploy
const site = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "hari", template: "%s · hari" },
  description:
    "Sarvajana Hari. Computer Engineering at NTU, software for NTU DeepSpeed's autonomous race car, climbing, trekking, and F1 trips.",
  openGraph: {
    title: "hari",
    description: "Robotics, race cars, boulder problems.",
    type: "website",
    locale: "en_SG",
  },
  twitter: { card: "summary_large_image", title: "hari", description: "Robotics, race cars, boulder problems." },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="grain min-h-full flex flex-col" suppressHydrationWarning>
        <Cursor />
        <Terminal />
        <PageWipe />
        <LidarPlayground />
        <SubPlayground />
        <DiveMode />
        <Weather />
        <Tilt />
        <RobotGate />
        <SiteNav />
        <ScrollCar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
