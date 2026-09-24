import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import ScrollCar from "@/components/ScrollCar";
import RobotGate from "@/components/RobotGate";
import Cursor from "@/components/Cursor";

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

export const metadata: Metadata = {
  title: { default: "hari", template: "%s · hari" },
  description:
    "Sarvajana Hari. Computer Engineering at NTU, software for NTU DeepSpeed's autonomous race car, climbing, trekking, and F1 trips.",
  openGraph: {
    title: "hari",
    description: "Robotics, race cars, boulder problems.",
    type: "website",
    locale: "en_SG",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="grain min-h-full flex flex-col" suppressHydrationWarning>
        <Cursor />
        <RobotGate />
        <SiteNav />
        <ScrollCar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
