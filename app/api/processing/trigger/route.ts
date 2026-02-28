import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { transcribeAudio, extractReportData } from "@/lib/gemini"
import { downloadMediaBuffer } from "@/lib/whatsapp"
import { uploadImage, uploadAudio, uploadVideo } from "@/lib/storage"

// GET — called by Vercel cron every minute
// POST — can be called manually for testing
export async function GET(request: NextRequest) {
  return runProcessing(request)
}

export async function POST(request: NextRequest) {
  return runProcessing(request)
}

async function runProcessing(_request: NextRequest) {
  const supabase = createAdminClient()

  const isDev = process.env.NODE_ENV === "development"

  if (!isDev) {
    const { data: lockData } = await supabase.rpc("try_processing_lock", { key: 20260001 })
    if (!lockData) {
      console.log("[trigger] Another instance is running, skipping")
      return NextResponse.json({ ok: true, skipped: true })
    }

    try {
      return await doProcess(supabase)
    } finally {
      await supabase.rpc("release_processing_lock", { key: 20260001 })
    }
  }

  return await doProcess(supabase)
}

async function doProcess(supabase: ReturnType<typeof createAdminClient>) {
  const CUTOFF_MINUTES = 3
  const cutoff = new Date(Date.now() - CUTOFF_MINUTES * 60 * 1000).toISOString()

  const { data: rows, error } = await supabase
    .from("message_buffer")
    .select("*")
    .lt("last_activity", cutoff)
    .order("received_at", { ascending: true })

  if (error) {
    console.error("[trigger] Failed to fetch buffer:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  // Group rows by phone_number
  const grouped = new Map<string, typeof rows>()
  for (const row of rows) {
    const existing = grouped.get(row.phone_number) ?? []
    existing.push(row)
    grouped.set(row.phone_number, existing)
  }

  let processed = 0

  for (const [phoneNumber, messages] of grouped) {
    try {
      const { data: supervisor } = await supabase
        .from("supervisors")
        .select("supervisor_id, site_id, name")
        .eq("phone_number", phoneNumber)
        .single()

      if (!supervisor?.site_id) {
        console.warn(`[trigger] No supervisor/site found for ${phoneNumber}, skipping`)
        await supabase
          .from("message_buffer")
          .delete()
          .in("buffer_id", messages.map((m) => m.buffer_id))
        continue
      }

      // Build combined text — also download + transcribe audio here so transcript is in raw_combined_text
      const textParts: string[] = []
      // Store downloaded audio buffers to upload after log is created
      const audioBuffers: Array<{ buffer: Buffer; mimeType: string }> = []

      for (const msg of messages) {
        if (msg.message_type === "text" && msg.content) {
          textParts.push(msg.content)
        } else if (msg.message_type === "audio" && msg.media_url) {
          const media = await downloadMediaBuffer(msg.media_url)
          if (media) {
            const transcript = await transcribeAudio(media.buffer, media.mimeType)
            if (transcript) textParts.push(`[Voice note]: ${transcript}`)
            audioBuffers.push(media)
          }
        } else if (msg.message_type === "image") {
          if (msg.content) textParts.push(`[Image caption]: ${msg.content}`)
        } else if (msg.message_type === "video") {
          if (msg.content) textParts.push(`[Video caption]: ${msg.content}`)
        }
      }

      const hasMedia = messages.some(
        (m) => ["image", "audio", "video"].includes(m.message_type) && m.media_url
      )

      if (textParts.length === 0 && !hasMedia) {
        console.warn(`[trigger] No processable content for ${phoneNumber}`)
        await supabase
          .from("message_buffer")
          .delete()
          .in("buffer_id", messages.map((m) => m.buffer_id))
        continue
      }

      if (textParts.length === 0) {
        textParts.push("[Site progress media attached]")
      }

      const combinedText = textParts.join("\n")
      const sourceTypes = [...new Set(messages.map((m) => m.message_type))]
      const extracted = await extractReportData(combinedText)
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

      const { data: logRow, error: insertError } = await supabase
        .from("daily_logs")
        .insert({
          site_id: supervisor.site_id,
          report_date: today,
          workers_present: extracted.workers_present,
          work_done: extracted.work_done,
          materials_needed: extracted.materials_needed,
          issues_flagged: extracted.issues_flagged,
          summary: extracted.summary,
          raw_combined_text: combinedText,
          source_types: sourceTypes,
          received_at: new Date().toISOString(),
        })
        .select("log_id")
        .single()

      if (insertError || !logRow?.log_id) {
        console.error(`[trigger] Failed to insert daily log for ${phoneNumber}:`, insertError?.message)
        continue
      }

      const logId = logRow.log_id

      // Upload images
      const imageMessages = messages.filter((m) => m.message_type === "image" && m.media_url)
      console.log(`[trigger] Found ${imageMessages.length} image(s) for ${phoneNumber}`)
      let imgIndex = 0
      for (const imgMsg of imageMessages) {
        try {
          const media = await downloadMediaBuffer(imgMsg.media_url)
          if (!media) continue
          const publicUrl = await uploadImage(media.buffer, media.mimeType, logId, imgIndex)
          if (publicUrl) {
            await supabase.from("media_files").insert({ log_id: logId, file_url: publicUrl, file_type: "image", mime_type: media.mimeType })
            imgIndex++
          }
        } catch (err) {
          console.error(`[trigger] Failed to process image for ${phoneNumber}:`, err)
        }
      }

      // Upload audio files (already downloaded above for transcription)
      console.log(`[trigger] Found ${audioBuffers.length} audio file(s) for ${phoneNumber}`)
      let audioIndex = 0
      for (const audioBuf of audioBuffers) {
        try {
          const publicUrl = await uploadAudio(audioBuf.buffer, audioBuf.mimeType, logId, audioIndex)
          if (publicUrl) {
            await supabase.from("media_files").insert({ log_id: logId, file_url: publicUrl, file_type: "audio", mime_type: audioBuf.mimeType })
            audioIndex++
          }
        } catch (err) {
          console.error(`[trigger] Failed to upload audio for ${phoneNumber}:`, err)
        }
      }

      // Upload videos
      const videoMessages = messages.filter((m) => m.message_type === "video" && m.media_url)
      console.log(`[trigger] Found ${videoMessages.length} video(s) for ${phoneNumber}`)
      let videoIndex = 0
      for (const vidMsg of videoMessages) {
        try {
          const media = await downloadMediaBuffer(vidMsg.media_url)
          if (!media) continue
          const publicUrl = await uploadVideo(media.buffer, media.mimeType, logId, videoIndex)
          if (publicUrl) {
            await supabase.from("media_files").insert({ log_id: logId, file_url: publicUrl, file_type: "video", mime_type: media.mimeType })
            videoIndex++
          }
        } catch (err) {
          console.error(`[trigger] Failed to process video for ${phoneNumber}:`, err)
        }
      }

      // Delete processed buffer rows
      await supabase
        .from("message_buffer")
        .delete()
        .in("buffer_id", messages.map((m) => m.buffer_id))

      console.log(`[trigger] Processed ${messages.length} messages for ${phoneNumber}`)
      processed++
    } catch (err) {
      console.error(`[trigger] Error processing ${phoneNumber}:`, err)
    }
  }

  return NextResponse.json({ ok: true, processed })
}
