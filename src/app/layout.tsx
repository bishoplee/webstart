import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { getIntegrationCapabilities } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WebStart | From Client Ideas to Development-Ready Projects",
    template: "%s | WebStart",
  },
  description:
    "Structured client onboarding, adaptive website discovery questionnaires, and automated 20-section project brief generation for web development agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { clerkConfigured } = getIntegrationCapabilities();

  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            {children}
            <Toaster richColors position="top-right" />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  if (clerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
