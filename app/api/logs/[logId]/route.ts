import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  const { logId } = await params

  if (!logId) {
    return NextResponse.json({ error: "Missing logId" }, { status: 400 })
  }

  // Auth check via cookie
  const cookieStore = await cookies()
  const auth = cookieStore.get("dpr_auth")
  if (auth?.value !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch media files before deleting so we can remove storage objects
  const { data: mediaFiles } = await supabase
    .from("media_files")
    .select("file_url, file_type")
    .eq("log_id", logId)

  // Delete storage objects for each media file
  if (mediaFiles && mediaFiles.length > 0) {
    const imageKeys: string[] = []
    const audioKeys: string[] = []
    const videoKeys: string[] = []

    for (const mf of mediaFiles) {
      // Extract the storage path from the public URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const url = mf.file_url
      const match = url.match(/\/object\/public\/[^/]+\/(.+)$/)
      if (!match) continue
      const key = match[1]

      if (mf.file_type === "image") imageKeys.push(key)
      else if (mf.file_type === "audio") audioKeys.push(key)
      else if (mf.file_type === "video") videoKeys.push(key)
    }

    if (imageKeys.length > 0) {
      const { error } = await supabase.storage.from("report-images").remove(imageKeys)
      if (error) console.error("[DELETE log] Failed to remove images:", error.message)
    }
    if (audioKeys.length > 0) {
      const { error } = await supabase.storage.from("report-audio").remove(audioKeys)
      if (error) console.error("[DELETE log] Failed to remove audio:", error.message)
    }
    if (videoKeys.length > 0) {
      const { error } = await supabase.storage.from("report-videos").remove(videoKeys)
      if (error) console.error("[DELETE log] Failed to remove videos:", error.message)
    }
  }

  // Delete the log — media_files rows cascade automatically
  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("log_id", logId)

  if (error) {
    console.error("[DELETE log] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
