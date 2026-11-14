import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { getIntegrationCapabilities } from "@/lib/env";

const isProtectedDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedDashboardRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: unknown) {
  const capabilities = getIntegrationCapabilities();
  if (!capabilities.clerkConfigured) {
    return NextResponse.next();
  }
  // @ts-expect-error Clerk middleware event type compatibility
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
