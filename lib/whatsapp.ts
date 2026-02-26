// Download a media file from Meta's WhatsApp Cloud API
// media_url stored in message_buffer is actually the WhatsApp media ID
// We first resolve it to a URL, then download the bytes
export async function downloadMediaBuffer(
  mediaId: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const token = process.env.WHATSAPP_TOKEN!
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!

  // Step 1: Get the media URL from the media ID
  const metaRes = await fetch(
    `https://graph.facebook.com/v22.0/${mediaId}?phone_number_id=${phoneNumberId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!metaRes.ok) {
    console.error("[whatsapp] Step1 failed — status:", metaRes.status, await metaRes.text())
    return null
  }

  const metaJson = await metaRes.json() as { url?: string; mime_type?: string }
  const { url, mime_type } = metaJson
  console.log("[whatsapp] Step1 resolved — url:", url ? url.slice(0, 60) + "..." : "MISSING", "mime:", mime_type)

  if (!url) {
    console.error("[whatsapp] No url in media response:", JSON.stringify(metaJson))
    return null
  }

  // Step 2: Download the actual media bytes
  const mediaRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!mediaRes.ok) {
    console.error("[whatsapp] Step2 failed — status:", mediaRes.status, await mediaRes.text())
    return null
  }

  const arrayBuffer = await mediaRes.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: mime_type ?? "image/jpeg",
  }
}
