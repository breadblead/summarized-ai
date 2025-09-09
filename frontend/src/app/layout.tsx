import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { getGlobalData, getGlobalPageMetadata } from "@/data/loaders";
import { Header } from "@/components/custom/Header";
import { Footer } from "@/components/custom/Footer";

function pick<T = any>(obj: any, key: string): T | null {
  return obj?.[key] ?? obj?.data?.[key] ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getGlobalPageMetadata();

  const title = pick<string>(meta, "title") ?? "Epic Next Course";
  const description = pick<string>(meta, "description") ?? "Epic Next Course";

  return { title, description };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const global = await getGlobalData();

  const headerData = pick(global, "header");
  const footerData = pick(global, "footer");

  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Toaster position="bottom-center" />
        {headerData && <Header data={headerData} />}
        {children}
        {footerData && <Footer data={footerData} />}
      </body>
    </html>
  );
}
