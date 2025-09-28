import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/lib/feature-flags";

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Feature flag checks - redirect to 404 for disabled features
  const flags = getFeatureFlags();

  // Check board feature
  if (pathname.startsWith('/Board') && !flags.board) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Check microblog feature
  if (pathname.startsWith('/microblog') && !flags.microblog) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Check projects feature
  if (pathname.startsWith('/projects') && !flags.projects) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Check about feature
  if (pathname.startsWith('/about') && !flags.about) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Check contact feature
  if (pathname.startsWith('/contact') && !flags.contact) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Check admin features
  if (pathname.startsWith('/admin')) {
    if (!flags.admin) {
      return new NextResponse('Feature not available', { status: 404 });
    }
    // Check specific admin routes
    if (pathname.startsWith('/admin/users') && !flags.userManagement) {
      return new NextResponse('Feature not available', { status: 404 });
    }
    if (pathname.startsWith('/admin/settings') && !flags.systemSettings) {
      return new NextResponse('Feature not available', { status: 404 });
    }
  }

  // Check offline feature
  if (pathname.startsWith('/offline') && !flags.offline) {
    return new NextResponse('Feature not available', { status: 404 });
  }

  // Add caching headers for better performance
  const response = NextResponse.next();

  // Cache static assets aggressively
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache images for 1 month
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=2592000');
  }

  // Cache fonts for 1 year
  if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
