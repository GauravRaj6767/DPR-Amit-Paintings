import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("dpr_auth")
  return auth?.value === process.env.DASHBOARD_PASSWORD
}

// PATCH /api/supervisors/:supervisorId — update site assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ supervisorId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { supervisorId } = await params
  const supabase = createAdminClient()

  let body: { site_id?: string | null; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if ("site_id" in body) updates.site_id = body.site_id ?? null
  if (body.name !== undefined) updates.name = body.name

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("supervisors")
    .update(updates)
    .eq("supervisor_id", supervisorId)
    .select()
    .single()

  if (error) {
    console.error("[PATCH supervisor] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, supervisor: data })
}

// DELETE /api/supervisors/:supervisorId — remove supervisor
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ supervisorId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { supervisorId } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("supervisors")
    .delete()
    .eq("supervisor_id", supervisorId)

  if (error) {
    console.error("[DELETE supervisor] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
