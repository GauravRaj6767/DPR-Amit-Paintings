import { NextRequest, NextResponse } from "next/server"

// Proxy Supabase storage files through Vercel to bypass ISP-level blocks
// on *.supabase.co (e.g. Jio/Airtel DNS blocking in India)
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  // Only proxy requests to our own Supabase project
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseHost = new URL(supabaseUrl).hostname
  let targetHost: string
  try {
    targetHost = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (targetHost !== supabaseHost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const upstream = await fetch(url, { cache: "force-cache" })

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: upstream.status })
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
  const body = await upstream.arrayBuffer()

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  })
}
