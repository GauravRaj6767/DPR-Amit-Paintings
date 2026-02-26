-- Companies
CREATE TABLE companies (
  company_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Sites
CREATE TABLE sites (
  site_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID REFERENCES companies(company_id),
  name         TEXT NOT NULL,
  location     TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Supervisors
CREATE TABLE supervisors (
  supervisor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       UUID REFERENCES sites(site_id),
  name          TEXT,
  phone_number  TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Message Buffer
CREATE TABLE message_buffer (
  buffer_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number  TEXT NOT NULL,
  message_type  TEXT NOT NULL,
  content       TEXT,
  media_url     TEXT,
  media_mime    TEXT,
  received_at   TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now()
);

-- Daily Logs
CREATE TABLE daily_logs (
  log_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id            UUID REFERENCES sites(site_id),
  report_date        DATE NOT NULL,
  received_at        TIMESTAMPTZ DEFAULT now(),
  workers_present    INTEGER,
  work_done          TEXT,
  materials_needed   TEXT,
  issues_flagged     TEXT,
  summary            TEXT,
  raw_combined_text  TEXT,
  source_types       TEXT[],
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_daily_logs_site_date
  ON daily_logs(site_id, report_date);

-- Media Files
CREATE TABLE media_files (
  media_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id       UUID REFERENCES daily_logs(log_id) ON DELETE CASCADE,
  file_url     TEXT NOT NULL,
  file_type    TEXT NOT NULL,
  mime_type    TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- pg_cron: purge logs older than 90 days (runs daily at 2am)
SELECT cron.schedule(
  'purge-old-logs',
  '0 2 * * *',
  $$DELETE FROM daily_logs WHERE created_at < now() - INTERVAL '90 days'$$
);

-- pg_cron: clean up stale buffer rows (runs every 30 minutes)
SELECT cron.schedule(
  'cleanup-stale-buffers',
  '*/30 * * * *',
  $$DELETE FROM message_buffer WHERE last_activity < now() - INTERVAL '30 minutes'$$
);
