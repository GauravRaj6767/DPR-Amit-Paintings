export type Site = {
  site_id: string
  company_id: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

export type Supervisor = {
  supervisor_id: string
  site_id: string | null
  name: string | null
  phone_number: string
  created_at: string
}

export type MessageBuffer = {
  buffer_id: string
  phone_number: string
  message_type: 'text' | 'audio' | 'image'
  content: string | null
  media_url: string | null
  media_mime: string | null
  received_at: string
  last_activity: string
}

export type DailyLog = {
  log_id: string
  site_id: string
  report_date: string
  received_at: string
  workers_present: number | null
  work_done: string | null
  materials_needed: string | null
  issues_flagged: string | null
  summary: string
  raw_combined_text: string | null
  source_types: string[]
  created_at: string
}

export type MediaFile = {
  media_id: string
  log_id: string
  file_url: string
  file_type: 'image' | 'audio'
  mime_type: string | null
  created_at: string
}

export type SiteWithStatus = Site & {
  reports_today: number
  last_update: string | null
  has_material_request: boolean
  has_issues: boolean
  latest_summary: string | null
}
