import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const loginUrl = new URL("/login", request.nextUrl.origin)
  const response = NextResponse.redirect(loginUrl, { status: 302 })
  response.cookies.delete("dpr_auth")
  return response
}
