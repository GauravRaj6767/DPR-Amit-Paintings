import { NextRequest, NextResponse } from "next/server"
import { upsertBuffer } from "@/lib/buffer"

// GET -- Meta webhook verification challenge
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode      = searchParams.get("hub.mode")
  const token     = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[webhook] Verification successful")
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn("[webhook] Verification failed")
  return new NextResponse("Forbidden", { status: 403 })
}

// POST -- Receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  let body: WhatsAppWebhookPayload

  try {
    body = await request.json()
  } catch {
    return new NextResponse("Bad Request", { status: 400 })
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue

      const messages = change.value?.messages ?? []
      const contacts = change.value?.contacts ?? []

      for (const msg of messages) {
        const displayName = contacts.find(
          (c) => c.wa_id === msg.from
        )?.profile?.name ?? msg.from

        await upsertBuffer(msg, displayName)
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

// Types
type WhatsAppWebhookPayload = {
  object: string
  entry: Array<{
    changes: Array<{
      field: string
      value: {
        messages?: WhatsAppMessage[]
        contacts?: Array<{
          wa_id: string
          profile: { name: string }
        }>
      }
    }>
  }>
}

export type WhatsAppMessage = {
  from: string
  id: string
  timestamp: string
  type: "text" | "audio" | "image" | "video" | string
  text?: { body: string }
  audio?: { id: string; mime_type: string }
  image?: { id: string; mime_type: string; caption?: string }
  video?: { id: string; mime_type: string; caption?: string }
}
