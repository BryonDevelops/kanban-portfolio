import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/presentation/components/ui/sidebar";
import { AppSidebar } from "@/presentation/components/layout/app-sidebar";
import { Topbar } from "@/presentation/components/layout/topbar";
import { FloatingActionContainer } from "@/presentation/components/layout/FloatingContactButton";
import { cookies } from "next/headers";
import { Toaster } from "@/presentation/components/ui/toaster";
import { ThemeProvider } from "@/presentation/components/shared/theme-provider";
import { PWAInstallPrompt } from "@/presentation/components/shared/pwa-install-prompt";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio - Full Stack Developer",
  description: "Full-stack developer crafting modern web applications with Next.js, TypeScript, and cutting-edge technologies. Passionate about clean code, beautiful design, and exceptional user experiences.",
  keywords: ["full-stack developer", "Next.js", "TypeScript", "React", "portfolio", "web development"],
  authors: [{ name: "Bryon Bauer" }],
  creator: "Bryon Bauer",
  publisher: "Bryon Bauer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8b5cf6",
};

async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider afterSignOutUrl="/">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider defaultOpen={defaultOpen}>
              {/* Full viewport background - outside sidebar to ensure full coverage */}
              <div className="fixed inset-0 -z-20 bg-transparent transition-colors duration-300" />
              {/* Lattice pattern covering entire viewport */}
              <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

              <AppSidebar />
              <SidebarInset>
                <div className="relative min-h-svh">
                  {/* Fixed topbar positioned at viewport top */}
                  <div className="fixed inset-x-0 top-0 z-15 pointer-events-none">
                    <div className="flex items-center pointer-events-auto px-2 md:px-4">
                      <div className="flex items-center gap-2 sm:gap-4 w-full justify-between">
                        <Topbar />
                      </div>
                    </div>
                  </div>
                  <div className="">
                    {children}
                  </div>
                </div>
              </SidebarInset>
              <FloatingActionContainer />
              <Toaster />
              <PWAInstallPrompt />
              <Analytics />
              <SpeedInsights />
            </SidebarProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

export default RootLayout;
