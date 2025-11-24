import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer, Slide } from "react-toastify";

// import { AuthProvider } from "../app/context/AuthProvider";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/constant";

import { AuthUserProvider } from "../app/context/AuthContext";

import { Header } from "@/components/header";
import "@/lib/styles/globals.css";
import { ClientLayout } from "@/components/ClientLayout";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tri-Fare-App",
  description: "A ride-sharing platform connecting users with drivers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = cookies().get(SESSION_COOKIE_NAME)?.value || null;


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
