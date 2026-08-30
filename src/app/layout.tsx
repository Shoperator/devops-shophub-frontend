import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PublicEnvScript } from "next-runtime-env";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopHub",
  description: "Create and manage your own shop sites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Publishes the NEXT_PUBLIC_ vars of the running container to the
            browser, so client components read the values this deployment was
            given instead of whatever was set when the image was built. */}
        <PublicEnvScript />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
