import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "dpr_auth"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 3 // 3 days in seconds

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, process.env.DASHBOARD_PASSWORD!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return response
}
