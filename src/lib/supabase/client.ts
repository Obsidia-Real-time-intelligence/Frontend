import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Use in client components and event handlers.
 * Reads env vars exposed via NEXT_PUBLIC_*.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
