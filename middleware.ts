import { NextResponse, type NextRequest } from "next/server"

const COOKIE_NAME = "dpr_auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(COOKIE_NAME)
  const isAuthenticated = authCookie?.value === process.env.DASHBOARD_PASSWORD

  // If not authenticated and trying to access dashboard, redirect to login
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If already authenticated and visiting login page, redirect to dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
