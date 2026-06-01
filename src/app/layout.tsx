import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SLOPARA | Banker Portal v1.0.0",
  description: "Operator and banker control console",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#05070d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Script id="webpushr-jssdk" strategy="afterInteractive">
          {`
            (function(w,d, s, id) {
              if(typeof(w.webpushr)!=='undefined') return;
              w.webpushr=w.webpushr||function(){(w.webpushr.q=w.webpushr.q||[]).push(arguments)};
              var js, fjs = d.getElementsByTagName(s)[0];
              js = d.createElement(s); js.id = id;js.async=1;
              js.src = "https://cdn.webpushr.com/app.min.js";
              fjs.parentNode.appendChild(js);
            }(window,document, 'script', 'webpushr-jssdk'));
            webpushr('setup',{'key':'BPLFlV_sxRAcFm_FPyitoyXgBG6ayH5LcwUj9y_O0z1_L4LAZ1CK5ubDRdckPzdliOctK0sYREwT9b8P-OxJeqA' });
          `}
        </Script>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
