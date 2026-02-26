import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/sites — add a new site
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { name?: string; location?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  // Get company_id from any existing site belonging to this user's company
  // (all sites share the same company in this single-tenant setup)
  const { data: anySite } = await supabase
    .from("sites")
    .select("company_id")
    .limit(1)
    .single()

  if (!anySite) {
    return NextResponse.json({ error: "No company found — add your first site directly in Supabase" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      name: body.name.trim(),
      location: body.location?.trim() || null,
      is_active: true,
      company_id: anySite.company_id,
    })
    .select()
    .single()

  if (error) {
    console.error("[POST site] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, site: data })
}
