import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { transcribeAudio, extractReportData } from "@/lib/gemini"
import { downloadMediaBuffer } from "@/lib/whatsapp"
import { uploadImage } from "@/lib/storage"

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

  // Skip advisory lock in development — dev server restarts drop connections
  // and leave the lock stuck, causing every subsequent call to be skipped.
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev) {
    // Postgres advisory lock — ensures only one instance runs at a time in production.
    // pg_try_advisory_lock returns false immediately if another instance holds the lock.
    const { data: lockData } = await supabase.rpc("pg_try_advisory_lock", { key: 20260001 })
    if (!lockData) {
      console.log("[trigger] Another instance is running, skipping")
      return NextResponse.json({ ok: true, skipped: true })
    }

    try {
      return await doProcess(supabase)
    } finally {
      await supabase.rpc("pg_advisory_unlock", { key: 20260001 })
    }
  }

  return await doProcess(supabase)
}

async function doProcess(supabase: ReturnType<typeof createAdminClient>) {
  // Cutoff: process messages where supervisor has been silent for this many minutes
  // TESTING: set to 1 — PRODUCTION: set back to 30
  const CUTOFF_MINUTES = 1
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
      // Look up the supervisor → get site_id
      const { data: supervisor } = await supabase
        .from("supervisors")
        .select("supervisor_id, site_id, name")
        .eq("phone_number", phoneNumber)
        .single()

      if (!supervisor?.site_id) {
        console.warn(`[trigger] No supervisor/site found for ${phoneNumber}, skipping`)
        // Delete these rows so they don't block future processing
        await supabase
          .from("message_buffer")
          .delete()
          .in("buffer_id", messages.map((m) => m.buffer_id))
        continue
      }

      // Build combined text from all messages
      const textParts: string[] = []

      for (const msg of messages) {
        if (msg.message_type === "text" && msg.content) {
          textParts.push(msg.content)
        } else if (msg.message_type === "audio" && msg.media_url) {
          // Download and transcribe audio
          const media = await downloadMediaBuffer(msg.media_url)
          if (media) {
            const transcript = await transcribeAudio(media.buffer, media.mimeType)
            if (transcript) textParts.push(`[Voice note]: ${transcript}`)
          }
        } else if (msg.message_type === "image") {
          // Use caption if available
          if (msg.content) textParts.push(`[Image caption]: ${msg.content}`)
        }
      }

      if (textParts.length === 0) {
        console.warn(`[trigger] No processable content for ${phoneNumber}`)
        await supabase
          .from("message_buffer")
          .delete()
          .in("buffer_id", messages.map((m) => m.buffer_id))
        continue
      }

      const combinedText = textParts.join("\n")
      const sourceTypes = [...new Set(messages.map((m) => m.message_type))]

      // Extract structured data with Gemini
      const extracted = await extractReportData(combinedText)

      // Write to daily_logs (upsert by site+date in case cron runs twice)
      const today = new Date().toISOString().split("T")[0]

      const { error: insertError } = await supabase
        .from("daily_logs")
        .upsert(
          {
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
          },
          { onConflict: "site_id,report_date" }
        )

      if (insertError) {
        console.error(`[trigger] Failed to insert daily log for ${phoneNumber}:`, insertError.message)
        continue
      }

      // Fetch the log_id we just upserted so we can attach media files
      const { data: logRow } = await supabase
        .from("daily_logs")
        .select("log_id")
        .eq("site_id", supervisor.site_id)
        .eq("report_date", today)
        .single()

      // Download and store any images from this batch
      if (logRow?.log_id) {
        const imageMessages = messages.filter((m) => m.message_type === "image" && m.media_url)
        let imgIndex = 0
        for (const imgMsg of imageMessages) {
          try {
            const media = await downloadMediaBuffer(imgMsg.media_url)
            if (!media) continue
            const publicUrl = await uploadImage(media.buffer, media.mimeType, logRow.log_id, imgIndex)
            if (publicUrl) {
              await supabase.from("media_files").insert({
                log_id: logRow.log_id,
                file_url: publicUrl,
                file_type: "image",
                mime_type: media.mimeType,
              })
              imgIndex++
            }
          } catch (imgErr) {
            console.error(`[trigger] Failed to process image for ${phoneNumber}:`, imgErr)
            // Don't abort — continue with other images and buffer cleanup
          }
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

