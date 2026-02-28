import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("dpr_auth")
  return auth?.value === process.env.DASHBOARD_PASSWORD
}

// PATCH /api/sites/:siteId — update name, location, or is_active
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { siteId } = await params
  const supabase = createAdminClient()

  let body: { name?: string; location?: string | null; is_active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.location !== undefined) updates.location = body.location
  if (body.is_active !== undefined) updates.is_active = body.is_active

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("sites")
    .update(updates)
    .eq("site_id", siteId)
    .select()
    .single()

  if (error) {
    console.error("[PATCH site] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, site: data })
}

// DELETE /api/sites/:siteId — permanently delete a site
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { siteId } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("site_id", siteId)

  if (error) {
    console.error("[DELETE site] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
