import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  
  // Public routes - NEVER protect
  const publicRoutes = [
    "/",
    "/sitemap.xml", 
    "/robots.txt",
  ];
  
  // Routes that start with these prefixes are public
  const publicPrefixes = [
    "/series/",
    "/sign-in",
    "/sign-up",
    "/api/test-series",  // Public API endpoint
  ];
  
  const isPublic = 
    publicRoutes.includes(pathname) ||
    publicPrefixes.some(prefix => pathname.startsWith(prefix));
  
  // If it's public, don't call auth.protect()
  if (isPublic) {
    return;
  }
  
  // All other routes require authentication
  auth.protect();
});

export const config = {
  matcher: [
    // Apply middleware to all routes EXCEPT these
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};