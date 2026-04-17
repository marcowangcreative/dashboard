import { createClient } from "@supabase/supabase-js";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Copy .env.example to .env.local and fill in your project values."
  );
}

// Browser/client and server-side (RSC) usage both hit this.
// For mutations we currently use the anon key — swap to a server-role client
// inside server actions once you tighten RLS.
export const supabase = createClient(url || "", anonKey || "", {
  auth: { persistSession: false },
});

export function serverClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return supabase;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
