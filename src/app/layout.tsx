import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

// Geist throughout, with the mono face reserved for identifiers — PR numbers,
// object ids, SKUs — so a code you might read aloud or paste is always set
// apart from the prose around it.

export const metadata: Metadata = {
  title: {
    default: "MKTA Procurement",
    template: "%s · MKTA Procurement",
  },
  description:
    "Procurement management system for purchase requests, supplier management, and purchasing workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body>
        <QueryProvider>
          <Toaster>
            <TooltipProvider>{children}</TooltipProvider>
          </Toaster>
        </QueryProvider>
      </body>
    </html>
  );
}
