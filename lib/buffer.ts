import { createAdminClient } from "@/lib/supabase/admin"
import type { WhatsAppMessage } from "@/app/api/whatsapp/webhook/route"

// Upsert a message into the buffer table.
// Each message is a separate row. last_activity is updated so the
// 30-minute cleanup cron resets on every new message from that number.
export async function upsertBuffer(msg: WhatsAppMessage, _displayName: string) {
  const supabase = createAdminClient()

  let messageType: "text" | "audio" | "image"
  let content: string | null = null
  let mediaUrl: string | null = null
  let mediaMime: string | null = null

  if (msg.type === "text") {
    messageType = "text"
    content = msg.text?.body ?? null
  } else if (msg.type === "audio") {
    messageType = "audio"
    mediaUrl = msg.audio?.id ?? null
    mediaMime = msg.audio?.mime_type ?? null
  } else if (msg.type === "image") {
    messageType = "image"
    mediaUrl = msg.image?.id ?? null
    mediaMime = msg.image?.mime_type ?? null
    content = msg.image?.caption ?? null
  } else {
    // Unsupported message type (location, sticker, etc.) -- ignore
    return
  }

  const { error } = await supabase.from("message_buffer").insert({
    phone_number:  msg.from,
    message_type:  messageType,
    content,
    media_url:     mediaUrl,
    media_mime:    mediaMime,
    received_at:   new Date(parseInt(msg.timestamp) * 1000).toISOString(),
    last_activity: new Date().toISOString(),
  })

  if (error) {
    console.error("[buffer] Failed to insert message:", error.message)
  }
}
