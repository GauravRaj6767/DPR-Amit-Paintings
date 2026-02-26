import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/supervisors — add a new supervisor
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { name?: string; phone_number?: string; site_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.phone_number || !body.site_id) {
    return NextResponse.json({ error: "phone_number and site_id are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("supervisors")
    .insert({
      name: body.name ?? null,
      phone_number: body.phone_number,
      site_id: body.site_id,
    })
    .select()
    .single()

  if (error) {
    console.error("[POST supervisor] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, supervisor: data })
}
