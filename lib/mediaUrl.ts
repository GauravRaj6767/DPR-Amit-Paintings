// Rewrite Supabase storage URLs to go through our Vercel proxy.
// This bypasses ISP-level DNS blocks on *.supabase.co (e.g. Jio/Airtel in India).
export function proxyUrl(supabaseUrl: string): string {
  return `/api/media/proxy?url=${encodeURIComponent(supabaseUrl)}`
}
