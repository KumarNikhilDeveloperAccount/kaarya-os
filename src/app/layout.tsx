import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import CrispBotLogic from "@/components/support/CrispBotLogic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kaarya.OS",
  description: "Hiring, decided.",
};

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <CrispBotLogic />
          <AppLayout>{children}</AppLayout>
          <Toaster richColors position="top-right" theme="dark" />
        </ThemeProvider>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `window.$crisp=[];window.CRISP_WEBSITE_ID="c2efd177-16df-49e1-8e62-633e261903ab";window.$crisp.push(["set", "position:reverse", [true]]);(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`
        }} />
      </body>
    </html>
  );
}
