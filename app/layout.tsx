import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { AppProvider } from "./context/AppContext"
import {ThemeProvider} from "@/app/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loveworld Foundation School Online",
  description: "An online replica of the onsite foundation school",
    icons: {
        icon: "/favicon.png", // Make sure this file exists in the `public/` folder
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <UserProvider>
            <AppProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </AppProvider>
          </UserProvider>

      </body>
    </html>
  );
}
