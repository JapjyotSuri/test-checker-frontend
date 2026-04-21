import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes — no auth required
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/forgot-password", "/sitemap.xml", "/robots.txt"];
const PUBLIC_PREFIXES = ["/series/", "/_next/", "/api/", "/uploads/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // Allow all bots and crawlers to access public content
  const isBotOrCrawler = /bot|crawler|spider|crawling/i.test(userAgent);

  if (isPublicPath(pathname) || isBotOrCrawler) {
    return NextResponse.next();
  }

  // Check for access token in Authorization header (SSR) or cookie
  const accessToken =
    req.cookies.get("caprep_access_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // Also check localStorage-based token via a custom header set by the client
  // (Next.js middleware can't read localStorage, so we rely on a cookie fallback)
  if (!accessToken) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
