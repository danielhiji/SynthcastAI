// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "../providers/ConvexClientProvider";
import AudioProvider from "@/providers/AudioProvider";
import { Toaster } from "@/components/ui/toaster";
import IsFetchingProvider from "@/providers/IsFetchingProvider";
import { ErrorBoundary } from "react-error-boundary";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synthcastai",
  description: "Generate podcasts in your language on the fly using AI",
  icons: {
    icon: '/icons/miclogo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <IsFetchingProvider>
            <AudioProvider>
              <body className={`${inter.className}`}>
                  {children}
                  <Analytics />        
              </body>
              {/* <Script async src="https://js.stripe.com/v3/pricing-table.js"></Script> */}
            </AudioProvider>
          </IsFetchingProvider>
        </ErrorBoundary>
    </html>
  );
}
