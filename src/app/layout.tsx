import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";

// Body copy uses the Segoe UI system stack defined in globals.css, matching the
// wireframes; only the mono face (chart tooltips) is a loaded webfont.
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

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
        <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
            <body>
                <Providers>
                    <TooltipProvider>{children}</TooltipProvider>
                </Providers>
            </body>
        </html>
    );
}
