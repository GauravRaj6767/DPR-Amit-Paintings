import { NextRequest, NextResponse } from "next/server"

// Proxy Supabase storage files through Vercel to bypass ISP-level blocks
// on *.supabase.co (e.g. Jio/Airtel DNS blocking in India).
// Forwards Range headers so audio/video seeking works correctly.
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

  // Forward Range header if present (needed for audio/video seeking)
  const upstreamHeaders: HeadersInit = {}
  const range = request.headers.get("range")
  if (range) upstreamHeaders["Range"] = range

  const upstream = await fetch(url, {
    headers: upstreamHeaders,
    // Don't cache range requests — only cache full responses
    cache: range ? "no-store" : "force-cache",
  })

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Upstream error" }, { status: upstream.status })
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
  const contentLength = upstream.headers.get("content-length")
  const contentRange = upstream.headers.get("content-range")
  const acceptRanges = upstream.headers.get("accept-ranges")

  const responseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": range ? "no-store" : "public, max-age=86400, immutable",
  }
  if (contentLength) responseHeaders["Content-Length"] = contentLength
  if (contentRange) responseHeaders["Content-Range"] = contentRange
  if (acceptRanges) responseHeaders["Accept-Ranges"] = acceptRanges

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}
