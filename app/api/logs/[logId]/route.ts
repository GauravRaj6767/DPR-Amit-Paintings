import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  const { logId } = await params

  if (!logId) {
    return NextResponse.json({ error: "Missing logId" }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
