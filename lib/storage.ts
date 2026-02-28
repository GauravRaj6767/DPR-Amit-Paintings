import { createAdminClient } from "@/lib/supabase/admin"

const IMAGE_BUCKET = "report-images"
const AUDIO_BUCKET = "report-audio"
const VIDEO_BUCKET = "report-videos"

async function uploadToStorage(
  bucket: string,
  buffer: Buffer,
  mimeType: string,
  logId: string,
  index: number,
  label: string
): Promise<string | null> {
  const supabase = createAdminClient()

  const ext = mimeType.split("/")[1]?.split(";")[0] ?? "bin"
  const path = `${logId}/${index}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mimeType, upsert: true })

  if (error) {
    console.error(`[storage] ${label} upload failed — path:`, path, "error:", error.message)
    return null
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  console.log(`[storage] ${label} uploaded OK — public url:`, data.publicUrl)
  return data.publicUrl
}

export function uploadImage(buffer: Buffer, mimeType: string, logId: string, index: number) {
  return uploadToStorage(IMAGE_BUCKET, buffer, mimeType, logId, index, "Image")
}

export function uploadAudio(buffer: Buffer, mimeType: string, logId: string, index: number) {
  return uploadToStorage(AUDIO_BUCKET, buffer, mimeType, logId, index, "Audio")
}

export function uploadVideo(buffer: Buffer, mimeType: string, logId: string, index: number) {
  return uploadToStorage(VIDEO_BUCKET, buffer, mimeType, logId, index, "Video")
}
