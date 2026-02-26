import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "report-images"

// Upload an image buffer to Supabase Storage.
// Returns the public URL, or null on failure.
export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  logId: string,
  index: number
): Promise<string | null> {
  const supabase = createAdminClient()

  const ext = mimeType.split("/")[1]?.split(";")[0] ?? "jpg"
  const path = `${logId}/${index}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    console.error("[storage] Upload failed — path:", path, "error:", error.message)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  console.log("[storage] Uploaded OK — public url:", data.publicUrl)
  return data.publicUrl
}
