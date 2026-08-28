import type { Metadata } from "next";
import { plusJakartaSans } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Attendance",
  description: "School/tutoring-center attendance admin & teacher dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} min-h-svh antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
