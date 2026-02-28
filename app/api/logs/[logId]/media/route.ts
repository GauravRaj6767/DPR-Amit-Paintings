import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  const { logId } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("media_files")
    .select("media_id, file_url, file_type, mime_type")
    .eq("log_id", logId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ media: data ?? [] })
}
