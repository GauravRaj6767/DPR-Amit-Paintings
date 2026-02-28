import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Called by Supabase pg_cron before purging old logs
// Deletes storage files for logs older than 90 days, then deletes the logs
export async function POST(request: NextRequest) {
  // Secure with the cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Find logs older than 90 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  const { data: oldLogs, error: fetchError } = await supabase
    .from("daily_logs")
    .select("log_id")
    .lt("created_at", cutoff.toISOString())

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!oldLogs || oldLogs.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 })
  }

  const logIds = oldLogs.map((l) => l.log_id)

  // Fetch all media files for these logs
  const { data: mediaFiles } = await supabase
    .from("media_files")
    .select("file_url, file_type")
    .in("log_id", logIds)

  // Delete storage objects grouped by bucket
  if (mediaFiles && mediaFiles.length > 0) {
    const imageKeys: string[] = []
    const audioKeys: string[] = []
    const videoKeys: string[] = []

    for (const mf of mediaFiles) {
      const match = mf.file_url.match(/\/object\/public\/[^/]+\/(.+)$/)
      if (!match) continue
      const key = match[1]
      if (mf.file_type === "image") imageKeys.push(key)
      else if (mf.file_type === "audio") audioKeys.push(key)
      else if (mf.file_type === "video") videoKeys.push(key)
    }

    if (imageKeys.length > 0) await supabase.storage.from("report-images").remove(imageKeys)
    if (audioKeys.length > 0) await supabase.storage.from("report-audio").remove(audioKeys)
    if (videoKeys.length > 0) await supabase.storage.from("report-videos").remove(videoKeys)

    console.log(`[cleanup] Removed ${imageKeys.length} images, ${audioKeys.length} audio, ${videoKeys.length} videos`)
  }

  // Delete the logs (media_files cascade automatically)
  const { error: deleteError } = await supabase
    .from("daily_logs")
    .delete()
    .in("log_id", logIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  console.log(`[cleanup] Purged ${logIds.length} old logs`)
  return NextResponse.json({ ok: true, deleted: logIds.length })
}
